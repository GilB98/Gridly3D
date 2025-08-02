document.addEventListener('DOMContentLoaded', () => {

    /* --- Navegação e Scroll Suave --- */
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('mainHeader');
    const sections = document.querySelectorAll('section[id]');
    
    function onScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;

        // Sticky Header & Color Change
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop - header.offsetHeight - 20;
            const sectionBottom = sectionTop + sec.offsetHeight;
            const id = sec.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                if (navLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                    if (header.classList.contains('scrolled')) {
                        navLink.style.color = 'var(--color-secondary)';
                    } else {
                        navLink.style.color = 'var(--color-white)';
                    }
                }
            } else {
                 if (navLink && header.classList.contains('scrolled')) {
                    navLink.style.color = 'var(--color-text-light)';
                 }
                 if (navLink && !header.classList.contains('scrolled')) {
                     navLink.style.color = 'rgba(255, 255, 255, 0.8)';
                 }
            }
        });
    }

    window.addEventListener('scroll', onScroll);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            window.scrollTo({
                top: targetSection.offsetTop - header.offsetHeight,
                behavior: 'smooth'
            });
        });
    });

    /* --- Animações "Reveal on Scroll" --- */
    const revealElements = document.querySelectorAll('.reveal-item');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* --- Modal do Portfólio --- */
    const modal = document.getElementById('projectModal');
    const modalImage = document.getElementById('modalProjectImage');
    const modalTitle = document.getElementById('modalProjectTitle');
    const modalDescription = document.getElementById('modalProjectDescription');
    const modalChallenges = document.getElementById('modalProjectChallenges');
    const modalSolution = document.getElementById('modalProjectSolution');
    const modalMaterials = document.getElementById('modalProjectMaterials');
    const closeBtn = document.querySelector('.close-button');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    const projectData = {
        project1: {
            image: 'img/portfolio-item-1.png',
            title: 'Geometria Arquitetónica',
            description: 'Exploração de formas complexas para maquetas de alta precisão.',
            challenges: 'Manter a integridade de estruturas finas e garantir acabamento suave.',
            solution: 'Utilização de resina de alta resolução e pós-processamento detalhado.',
            materials: 'Resina de fotopolímero de alta detalhe.'
        },
        project2: {
            image: 'img/portfolio-item-2.png',
            title: 'Engenharia de Componentes',
            description: 'Protótipo funcional para validação de design e desempenho mecânico.',
            challenges: 'Criar peças com tolerâncias apertadas e resistência mecânica.',
            solution: 'Impressão FDM com materiais de engenharia e otimização da orientação da peça.',
            materials: 'Filamento ABS de alta resistência.'
        },
        project3: {
            image: 'img/portfolio-item-3.png',
            title: 'Arte e Design Exclusivo',
            description: 'Escultura personalizada com detalhes intrincados e acabamento de luxo.',
            challenges: 'Capturar detalhes artísticos e obter um acabamento final polido.',
            solution: 'Impressão com resina para alto detalhe, seguida de lixamento manual e pintura metálica.',
            materials: 'Resina de fotopolímero e acabamento em pintura acrílica.'
        },
        project4: {
            image: 'img/portfolio-item-4.png',
            title: 'Ferramentas e Moldes',
            description: 'Componentes industriais de alta resistência e precisão para otimização de processo.',
            challenges: 'Produzir ferramentas leves, mas robustas, para uso em ambiente de produção.',
            solution: 'Uso de materiais reforçados com fibra de carbono e design de treliça interna para resistência e peso otimizados.',
            materials: 'Nylon reforçado com fibra de carbono.'
        }
    };

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const projectId = item.getAttribute('data-project');
            const data = projectData[projectId];
            
            modalImage.src = data.image;
            modalTitle.textContent = data.title;
            modalDescription.textContent = data.description;
            modalChallenges.textContent = data.challenges;
            modalSolution.textContent = data.solution;
            modalMaterials.textContent = data.materials;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    /* --- Carrossel de Testemunhos --- */
    const carouselWrapper = document.querySelector('.testimonial-wrapper');
    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    let currentIndex = 0;
    
    function createDots() {
        dotsContainer.innerHTML = '';
        testimonialItems.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateCarousel() {
        const itemWidth = testimonialItems[0].clientWidth + 20; // 20px de margin
        carouselWrapper.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : testimonialItems.length - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < testimonialItems.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
    createDots();
    updateCarousel();

    /* --- Formulário de Orçamento (Validação em tempo real) --- */
    const quoteForm = document.getElementById('quoteForm');
    const formStatusMessage = document.getElementById('form-status-message');
    const formGroups = document.querySelectorAll('.form-group');

    const validators = {
        nome: (value) => value.trim().length > 2,
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        telefone: (value) => value === '' || /^\+?\d{9,15}$/.test(value),
        ficheiro: (files) => true, // Validação de ficheiro é complexa, deixamos passar no frontend.
        imagens: (files) => true, // Idem
        notas: (value) => true
    };

    const errorMessages = {
        nome: 'Por favor, insere o teu nome completo.',
        email: 'Por favor, insere um email válido.',
        telefone: 'Por favor, insere um número de telefone válido (opcional).',
    };

    function validateField(input, validator, errorMsg) {
        const value = input.type === 'file' ? input.files : input.value;
        const isValid = validator(value);
        const formGroup = input.closest('.form-group');
        const errorMessageDiv = formGroup.querySelector('.error-message');

        if (isValid) {
            formGroup.classList.remove('invalid');
            formGroup.classList.add('valid');
            errorMessageDiv.style.display = 'none';
        } else {
            formGroup.classList.remove('valid');
            formGroup.classList.add('invalid');
            errorMessageDiv.textContent = errorMsg;
            errorMessageDiv.style.display = 'block';
        }
        return isValid;
    }

    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        if (input) {
            input.addEventListener('input', () => {
                const fieldName = input.id;
                if (validators[fieldName]) {
                    validateField(input, validators[fieldName], errorMessages[fieldName]);
                }
            });
        }
    });

    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isFormValid = true;

        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            if (input && validators[input.id] && input.hasAttribute('required')) {
                if (!validateField(input, validators[input.id], errorMessages[input.id])) {
                    isFormValid = false;
                }
            }
        });

        if (isFormValid) {
            // Aqui seria a lógica para enviar o formulário, por exemplo com fetch().
            // Para um site estático, isto seria um serviço como o Formspree ou Netlify Forms.
            // Apenas simulamos o sucesso no frontend.
            formStatusMessage.textContent = 'O teu pedido de orçamento foi enviado com sucesso! Entraremos em contacto brevemente.';
            formStatusMessage.classList.remove('error');
            formStatusMessage.classList.add('success');
            formStatusMessage.style.display = 'block';
            quoteForm.reset();
            // Limpa as classes de validação após o reset
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('valid');
                group.classList.remove('invalid');
            });
            setTimeout(() => {
                formStatusMessage.style.display = 'none';
            }, 5000);
        } else {
            formStatusMessage.textContent = 'Por favor, corrige os erros no formulário antes de enviar.';
            formStatusMessage.classList.remove('success');
            formStatusMessage.classList.add('error');
            formStatusMessage.style.display = 'block';
        }
    });

    /* --- Botão "Voltar ao Topo" --- */
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }
    });

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});