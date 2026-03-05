// ================== SCROLL ANIMATIONS ==================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', function() {
    // Animate cards on scroll
    const cards = document.querySelectorAll('.skill-card, .project-card, .stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });

    // Animate sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Animate skill items on skills page
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
        observer.observe(item);
    });

    // Animate project items on projects page
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.08}s`;
        observer.observe(item);
    });
});

// ================== MICRO-INTERACTIONS ==================

// 1. Navbar Active Link Indicator
function setupNavbarIndicator() {
    const navLinks = document.querySelectorAll('.nav-links a:not(.admin-link)');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(212, 175, 55, 0.6)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    });
}

// 2. Button Hover Glow Effect
function setupButtonGlow() {
    const buttons = document.querySelectorAll('.gold-btn, .btn-add, .btn-login, .submit-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.background = `radial-gradient(circle at ${x}px ${y}px, #f5d572, #d4af37)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.background = '';
        });
    });
}

// 3. Card Hover Polish
function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.skill-card, .project-card, .stat-card, .skill-item, .project-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.5)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

// Initialize all micro-interactions
document.addEventListener('DOMContentLoaded', function() {
    setupNavbarIndicator();
    setupButtonGlow();
    setupCardHoverEffects();
});

// ================== SMOOTH SCROLL ==================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================== AI CHATBOT WIDGET ==================
function initAIChatbot() {
    // Create chatbot container
    const chatbotHTML = `
        <div id="aiBotContainer" class="ai-bot-container">
            <div class="ai-bot-header">
                <h3>🤖 AI Assistant</h3>
                <button id="closeChatbot" class="close-chatbot">✕</button>
            </div>
            <div id="chatbotMessages" class="chatbot-messages">
                <div class="bot-message">
                    👋 Hi! I'm Manoj's AI Assistant. How can I help you today?
                    <div class="quick-replies">
                        <button class="quick-reply" data-question="Tell me about Manoj">About Manoj</button>
                        <button class="quick-reply" data-question="What are your skills">Skills</button>
                        <button class="quick-reply" data-question="Show me your projects">Projects</button>
                        <button class="quick-reply" data-question="How to contact you">Contact</button>
                    </div>
                </div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatbotInput" placeholder="Ask me anything...">
                <button id="sendChatbot">Send</button>
            </div>
        </div>
        <button id="chatbotToggle" class="chatbot-toggle">
            <span>💬</span>
        </button>
    `;

    // Add chatbot to page
    if (!document.getElementById('aiBotContainer')) {
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    // AI Responses
    const aiResponses = {
        'tell me about manoj': 'I\'m Manoj, a passionate web developer with expertise in HTML, CSS, JavaScript, and AI integration. I specialize in creating modern, responsive websites with smooth animations and user-friendly designs.',
        'what are your skills': 'My skills include: HTML5, CSS3, JavaScript (ES6+), Responsive Design, AI Integration, Chatbot Development, Node.js, and more. Check out the Skills page to see the complete list!',
        'show me your projects': 'I have several projects showcasing my expertise: AI Chatbot, Modern Portfolio (this one!), E-commerce Frontend, and more. Visit the Projects page to see detailed descriptions.',
        'how to contact you': 'You can reach me through the Contact page! I check my emails regularly and respond within 24 hours. You can also send a message directly from the contact form.',
        'ai features': 'I\'m powered by AI to help answer your questions! I can discuss projects, skills, and help you learn more about me. Try asking about specific topics!',
        'default': 'That\'s a great question! Feel free to explore the portfolio, check out my projects, or visit the contact page to reach out directly. You can also ask me about specific topics!'
    };

    // Setup chatbot interactions
    const chatInput = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('sendChatbot');
    const chatMessages = document.getElementById('chatbotMessages');
    const chatToggle = document.getElementById('chatbotToggle');
    const closeBtn = document.getElementById('closeChatbot');
    const chatContainer = document.getElementById('aiBotContainer');

    // Toggle chatbot
    chatToggle.addEventListener('click', function() {
        chatContainer.classList.toggle('active');
        if (chatContainer.classList.contains('active')) {
            chatInput.focus();
        }
    });

    // Close chatbot
    closeBtn.addEventListener('click', function() {
        chatContainer.classList.remove('active');
    });

    // Send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'user-message';
        userDiv.textContent = message;
        chatMessages.appendChild(userDiv);

        // Clear input
        chatInput.value = '';

        // Simulate AI thinking
        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.className = 'bot-message';
            
            // Get AI response
            const messageLower = message.toLowerCase();
            let response = aiResponses['default'];
            
            for (let key in aiResponses) {
                if (messageLower.includes(key)) {
                    response = aiResponses[key];
                    break;
                }
            }
            
            botDiv.textContent = response;
            chatMessages.appendChild(botDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Quick replies
    document.querySelectorAll('.quick-reply').forEach(btn => {
        btn.addEventListener('click', function() {
            chatInput.value = this.dataset.question;
            chatInput.focus();
            sendMessage();
        });
    });
}

// Initialize chatbot on load
document.addEventListener('DOMContentLoaded', initAIChatbot);

// ================== PAGE LOAD ANIMATIONS ==================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Stagger hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'slideInUp 0.8s ease-out';
    }
});
