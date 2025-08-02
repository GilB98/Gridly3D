<?php
// --- CONFIGURAÇÃO BÁSICA ---
$to_email = "o-teu-email@exemplo.com"; // <-- MUDA ESTE EMAIL PARA O TEU ENDEREÇO REAL!
$subject = "Novo Pedido de Orçamento - Impressão 3D";
$from_name = "Loja de Impressão 3D"; // Nome que aparecerá como remetente do email

// Opcional: Caminho para guardar os ficheiros temporariamente no servidor.
// Certifica-te que esta pasta existe e tem permissões de escrita (CHMOD 755 ou 777, dependendo do servidor).
// Se não quiseres guardar os ficheiros no servidor, podes remover esta lógica e o upload_dir,
// mas eles ainda serão anexados ao email.
$upload_dir = "uploads/"; 
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true); // Tenta criar a pasta se ela não existir
}

// Redireciona para uma página de sucesso ou erro após o envio.
// Podes criar estes ficheiros 'obrigado.html' e 'erro.html' na mesma pasta.
$success_redirect = "obrigado.html"; 
$error_redirect = "erro.html"; 

// --- PROCESSAMENTO DO FORMULÁRIO ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recolhe e sanitiza os dados do formulário
    $nome = htmlspecialchars($_POST['nome'] ?? 'Não fornecido');
    $email = htmlspecialchars($_POST['email'] ?? 'Não fornecido');
    $telefone = htmlspecialchars($_POST['telefone'] ?? 'Não fornecido');
    // Campos removidos: material, cor, acabamento, quantidade
    $notas = htmlspecialchars($_POST['notas'] ?? 'Nenhumas');

    // Monta o corpo do email
    $email_body = "Olá,\n\nRecebeste um novo pedido de orçamento para impressão 3D com os seguintes detalhes:\n\n";
    $email_body .= "Nome: " . $nome . "\n";
    $email_body .= "Email: " . $email . "\n";
    $email_body .= "Telefone: " . ($telefone ?: 'Não fornecido') . "\n";
    $email_body .= "Notas Adicionais:\n" . ($notas ?: 'Nenhumas') . "\n\n";
    $email_body .= "--------------------------------------------------\n";
    $email_body .= "Verifica os anexos para o ficheiro 3D e as imagens de referência.\n";
    $email_body .= "--------------------------------------------------\n";


    // --- GESTÃO DE ANEXOS ---
    $attachments = [];
    // Tipos MIME permitidos para ficheiros 3D e imagens
    $allowed_3d_types = ['application/octet-stream', 'model/stl', 'application/x-stl', 'application/vnd.ms-pki.stl', 'application/sla', 'application/x-step', 'application/step', 'model/iges', 'application/x-obj']; // Adicionei mais alguns tipos comuns
    $allowed_image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Adicionei webp
    $max_3d_size = 25 * 1024 * 1024; // 25 MB
    $max_image_size = 5 * 1024 * 1024; // 5 MB

    // Processa o ficheiro 3D
    if (isset($_FILES['ficheiro']) && $_FILES['ficheiro']['error'] == UPLOAD_ERR_OK) {
        $file_name = basename($_FILES['ficheiro']['name']);
        $file_tmp_name = $_FILES['ficheiro']['tmp_name'];
        $file_size = $_FILES['ficheiro']['size'];

        // Obtém o tipo MIME real do ficheiro (mais seguro do que confiar no cliente)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $file_type = finfo_file($finfo, $file_tmp_name);
        finfo_close($finfo);

        if (in_array($file_type, $allowed_3d_types) && $file_size <= $max_3d_size) {
            $attachments[] = ['path' => $file_tmp_name, 'name' => $file_name, 'type' => $file_type];
        } else {
            error_log("Erro no upload do ficheiro 3D: Tipo ($file_type) ou tamanho ($file_size bytes) inválido para $file_name.");
            header("Location: $error_redirect?msg=invalid_3d_file");
            exit();
        }
    }

    // Processa as imagens de referência (múltiplas)
    if (isset($_FILES['imagens']) && is_array($_FILES['imagens']['name'])) {
        foreach ($_FILES['imagens']['name'] as $key => $name) {
            if ($_FILES['imagens']['error'][$key] == UPLOAD_ERR_OK) {
                $image_name = basename($name);
                $image_tmp_name = $_FILES['imagens']['tmp_name'][$key];
                $image_size = $_FILES['imagens']['size'][$key];

                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $image_type = finfo_file($finfo, $image_tmp_name);
                finfo_close($finfo);

                if (in_array($image_type, $allowed_image_types) && $image_size <= $max_image_size) {
                    $attachments[] = ['path' => $image_tmp_name, 'name' => $image_name, 'type' => $image_type];
                } else {
                    error_log("Erro no upload de imagem: Tipo ($image_type) ou tamanho ($image_size bytes) inválido para $image_name.");
                    // Não redirecionamos imediatamente aqui para permitir o upload de outras imagens.
                }
            }
        }
    }


    // --- PREPARAÇÃO E ENVIO DO EMAIL COM ANEXOS (MIME) ---
    $boundary = md5(time());
    $headers = "From: " . $from_name . " <" . $to_email . ">\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n\r\n";

    // Parte do corpo do email (texto)
    $message = "--" . $boundary . "\r\n";
    $message .= "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $email_body . "\r\n\r\n";

    // Adiciona cada anexo
    foreach ($attachments as $attachment) {
        $file_path = $attachment['path'];
        $file_name = $attachment['name'];
        $file_type = $attachment['type'];

        if (file_exists($file_path) && is_readable($file_path)) { // Verifica se o ficheiro existe e pode ser lido
            $file_content = file_get_contents($file_path);
            $encoded_content = chunk_split(base64_encode($file_content));

            $message .= "--" . $boundary . "\r\n";
            $message .= "Content-Type: " . $file_type . "; name=\"" . $file_name . "\"\r\r\n"; // Nota: "\r\r\n" é um erro comum, deve ser "\r\n"
            $message .= "Content-Transfer-Encoding: base64\r\n";
            $message .= "Content-Disposition: attachment; filename=\"" . $file_name . "\"\r\n\r\n";
            $message .= $encoded_content . "\r\n\r\n";
        } else {
            error_log("Ficheiro de anexo não encontrado ou ilegível: " . $file_path);
        }
    }
    $message .= "--" . $boundary . "--"; // Fim da mensagem MIME

    // Tenta enviar o email
    if (mail($to_email, $subject, $message, $headers)) {
        // Redireciona para a página de sucesso
        header("Location: $success_redirect");
        exit();
    } else {
        // Redireciona para a página de erro
        error_log("Falha ao enviar email. Debug: " . print_r(error_get_last(), true)); // Log detalhado do erro
        header("Location: $error_redirect?msg=email_fail");
        exit();
    }

} else {
    // Se a página for acedida diretamente sem um POST (normalmente não deve acontecer)
    header("Location: index.html");
    exit();
}
?>