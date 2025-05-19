document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('login-error');
    const sairButton = document.getElementById('sairButton'); // Pega a referência do novo botão


    // URL do Web App - use a mesma que está no seu Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJwZzrMI8OGfhhVNQkDQI0NvrvNdbtxJIwOVDNw-WcQoDrcOebYSxsn2CC5QAnAfGE/exec';

    // AJUSTE PARA DESENVOLVIMENTO: Mostra conteúdo principal, esconde tela de login
    if (appContent) appContent.classList.add('hidden'); // MOSTRA o conteúdo do app
    if (loginScreen) loginScreen.classList.remove('hidden');    // ESCONDE a tela de login
    // FIM DO AJUSTE PARA DESENVOLVIMENTO

    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                loginError.textContent = 'Por favor, preencha usuário e senha.';
                loginError.classList.remove('hidden');
                return;
            }

            loginError.classList.add('hidden');
            loginButton.disabled = true;
            loginButton.textContent = 'Verificando...';
            loginButton.classList.add('button-loading'); // Adiciona a classe de loading
            

            try {
                // Método alternativo que contorna CORS
                const response = await fetch(`${SCRIPT_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
                    method: 'GET',
                    redirect: 'follow'
                });

                // O Google Apps Script retorna um redirecionamento
                const finalUrl = response.url;
                const result = await fetch(finalUrl);
                const data = await result.json();

                if (data.success) {
                    loginScreen.classList.add('hidden');
                    appContent.classList.remove('hidden');
                    // Aqui você pode carregar o restante do app

                // Exibir o nome do usuário logado
                    const userDisplayBox = document.getElementById('user-display-box');
                    if (userDisplayBox) {
                        userDisplayBox.textContent = username; // 'username' é a variável que já contém o login
                        userDisplayBox.style.display = 'block';userDisplayBox.title = "Sair"; // Adiciona dica

                        // Adiciona funcionalidade de clique para recarregar a página
                        userDisplayBox.addEventListener('click', () => {
                            location.reload();
                        });
                    }


                } else {
                    loginError.textContent = data.message || 'Credenciais inválidas';
                    loginError.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Erro:', error);
                loginError.textContent = 'Erro ao conectar com o servidor';
                loginError.classList.remove('hidden');
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Entrar';
                loginButton.classList.remove('button-loading'); // Remove a classe de loading
                
            }
        });
    }

    // Login com Enter
    [usernameInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginButton.click();
            });
        }
    });

    // Adiciona funcionalidade ao novo botão "sairButton"
    if (sairButton) {
        sairButton.addEventListener('click', () => {
            location.reload(); // Recarrega a página, mesma ação do userDisplayBox
        });
    }
});
