# Estaciona Fácil

Jogo 2D de estacionamento com visão superior. Você é um manobrista: conduza carros e até um ônibus até a vaga-alvo, pare e alinhe com precisão, evitando paredes, veículos e obstáculos. São doze fases progressivas, incluindo baliza, avenidas com trânsito inteligente e uma fila que aguarda o jogador liberar a rua, com pontuação, penalidades, música-tema e efeitos sonoros gerados no navegador.

## Controles

- `W` ou `↑`: acelerar
- `S` ou `↓`: frear e dar ré
- `A`/`D` ou `←`/`→`: virar
- `P` ou `Esc`: pausar
- Em celulares e tablets, use os quatro botões abaixo do jogo.

## Estrutura

```text
index.html       Interface, placar e Canvas
style.css        Visual responsivo e acessibilidade
game.js          Física, colisões, fases, áudio e persistência
assets/images/   Reservado para imagens futuras
assets/sounds/   Reservado para áudio futuro
```

## Executar localmente

Abra `index.html` diretamente em um navegador moderno. Não há instalação nem compilação. Também é possível servir a pasta com qualquer servidor HTTP estático.

## Publicar no GitHub Pages

1. Envie todos os arquivos para a raiz de um repositório no GitHub.
2. Abra **Settings → Pages** no repositório.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main`, pasta `/(root)`, e clique em **Save**.
5. Aguarde o endereço `https://seu-usuario.github.io/nome-do-repositorio/` ficar disponível.

Todos os caminhos são relativos. O projeto usa somente HTML, CSS e JavaScript, funciona inteiramente no navegador e não precisa de backend, banco de dados ou API.
