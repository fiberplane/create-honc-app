import type { FC } from "hono/jsx";
import { Style, css } from "hono/css";
import { html } from "hono/html";

const globalClassName = css`
    body {
      font-family: 'Mountains of Christmas', cursive;
      background-color: #034f1d;
      background-image: 
        radial-gradient(white 2px, transparent 2px),
        radial-gradient(white 2px, transparent 2px);
      background-size: 50px 50px;
      background-position: 0 0, 25px 25px;
      color: #fff;
      text-align: center;
      padding: 50px 20px;
      min-height: 100vh;
      margin: 0;
      position: relative;
    }

    /* Candy cane borders */
    body::before, body::after {
      content: "";
      position: fixed;
      top: 0;
      bottom: 0;
      width: 30px;
      background: repeating-linear-gradient(
        45deg,
        #ff0000,
        #ff0000 10px,
        #ffffff 10px,
        #ffffff 20px
      );
    }
    body::before { left: 0; }
    body::after { right: 0; }

    h1 {
      color: #ff0000;
      font-size: 48px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3),
                  0 0 20px rgba(255,255,255,0.8);
      margin-bottom: 30px;
    }

    .movie-container {
      background-color: rgba(255, 255, 255, 0.9);
      border: 5px solid #ff0000;
      border-radius: 15px;
      padding: 30px;
      margin: 0 auto;
      max-width: 600px;
      box-shadow: 0 0 20px rgba(255,0,0,0.3);
      position: relative;
    }

    /* Decorative candy canes */
    .movie-container::before,
    .movie-container::after {
      content: "🍬";
      font-size: 40px;
      position: absolute;
      top: -20px;
    }
    .movie-container::before { left: 20px; transform: rotate(-45deg); }
    .movie-container::after { right: 20px; transform: rotate(45deg); }

    .input-field {
      width: 80%;
      padding: 15px;
      font-size: 18px;
      border: 3px solid #ff0000;
      border-radius: 10px;
      margin-bottom: 20px;
      font-family: inherit;
    }

    .generate-btn {
      font-family: inherit;
      background-color: #ff0000;
      color: #fff;
      border: none;
      padding: 15px 30px;
      font-size: 24px;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.3s ease;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    .generate-btn:hover {
      background-color: #cc0000;
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(255,0,0,0.5);
    }

    .decorations {
      position: fixed;
      font-size: 30px;
      z-index: 1000;
    }
    .decorations span {
      position: absolute;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    #result {
      margin-top: 30px;
      color: #034f1d;
      font-size: 18px;
      line-height: 1.8;
      text-align: left;
      background: rgba(255, 255, 255, 0.95);
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      position: relative;
      font-family: 'Nunito', sans-serif;
      letter-spacing: 0.2px;
    }

    #result::before {
      content: "🎬";
      position: absolute;
      top: -15px;
      left: -15px;
      font-size: 30px;
    }

    #result::after {
      content: "✨";
      position: absolute;
      bottom: -15px;
      right: -15px;
      font-size: 30px;
    }

    .movie-title {
      color: #cc0000;
      font-size: 24px;
      font-weight: bold;
      margin: 25px 0 15px;
      text-align: center;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
      font-family: 'Mountains of Christmas', cursive;
    }

    .loading-animation {
      display: inline-block;
      animation: sparkle 1.5s infinite;
    }

    @keyframes sparkle {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
`;


export const HomePage: FC = () => {
  return (
    <html lang="en">
      <head>
        <title>🎄 Christmas Movie Generator 🎅</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎄</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&family=Nunito:wght@400;600&display=swap"
          rel="stylesheet"
        />
        <Style>{globalClassName}</Style>
      </head>
      <body>
        {/* Floating decorations */}
        <div class="decorations">
          <span style="top: 20px; left: 10%;">❄️</span>
          <span style="top: 50px; right: 15%;">🎄</span>
          <span style="top: 150px; left: 20%;">🎅</span>
          <span style="top: 200px; right: 25%;">🎁</span>
          <span style="bottom: 100px; left: 15%;">⛄</span>
          <span style="bottom: 150px; right: 10%;">🦌</span>
        </div>

        <h1>🎄 Magical Christmas Movie Generator 🎅</h1>
        <div class="movie-container">
          <p style="font-size: 24px; margin-bottom: 20px; color: #034f1d; font-weight: 500;">Add an idea, big or small, and start writing your own christmas movie!</p>
          <form id="movieForm" onsubmit="handleSubmit(event)">
            <input
              type="text"
              class="input-field"
              placeholder="add an idea (e.g., 'elf', 'santa', 'snow')"
            />
            <button class="generate-btn" type="submit">
              Make Holiday Magic! ✨
            </button>
          </form>
          <div id="result" style="margin-top: 20px; color: #034f1d; font-size: 20px;" />
        </div>

        <MovieGeneratorScript />
      </body>
    </html>
  );
};


function MovieGeneratorScript() {
  return (
    <>
      {html`
        <script>
          function formatMovieIdea(text) {
            // Look for movie titles wrapped in **
            text = text.replace(/\\*\\*(.*?)\\*\\*/g, '<div class="movie-title">$1</div>');
            
            // Add line breaks only after complete sentences, but avoid duplicates
            text = text.replace(/([.!?])\s+/g, function(match) {
              // Don't add <br> if it's already there
              if (text.indexOf(match + '<br>') >= 0) return match;
              return match + '<br><br>';
            });
            
            return text;
          }

          async function handleSubmit(event) {
            event.preventDefault();
            await generateMovie();
          }

          async function generateMovie() {
            const input = document.querySelector('.input-field').value;
            const result = document.getElementById('result');

            result.innerHTML = '<span class="loading-animation">Generating your magical Christmas movie... ✨</span>';
            
            try {
              const response = await fetch('/api/together', {
                method: 'POST',
                body: JSON.stringify({ prompt: input }),
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              const reader = response.body.getReader();
              let movieIdea = '';

              while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                // Convert the Uint8Array to text
                const text = new TextDecoder().decode(value);
                movieIdea += text;
                
                // Format and update the result div with accumulated text
                result.innerHTML = formatMovieIdea(movieIdea);
              }
            } catch (error) {
              console.error('Error:', error);
              result.innerHTML = "Oops! Something went wrong while generating your movie idea! 🎬❌";
            }
          }
        </script>
      `}
    </>
  );
}
