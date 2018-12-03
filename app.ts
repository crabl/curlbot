const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const ejs = require('ejs');


const app = express();
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  const state = {
    end: 1,
    position: '2ND',
    rock: 2
  };
  
  return res.render('index', state);
});

const PORT = process.env.PORT || 8080;
console.log(`curlbot listening on port ${PORT}`);
app.listen(PORT);

// const readline = require('readline');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// async function ask(question) {
//   return new Promise((resolve) => {
//     rl.question(question, (answer) => {
//       resolve(answer);
//     });
//   }) as Promise<string>;
// }

// const positions = ['Lead', 'Second', 'Third', 'Skip']

// let game_over = false;
// let end = 1;
// let players = [ [], [], [], [] ];

// (async function main() {
//   while (!game_over) {
//     for (let i = 0; i < 4; i++) {
//       const position = positions[i];
//       let cum_score = 0;
//       for (let rock = 1; rock <= 2; rock++) {
//         const shot_score = await ask(`E${end} ${position} R${rock}: `);
//         cum_score += parseInt(shot_score, 10);
//       }
//       players[i].push(cum_score);
//     }

//     if (await ask('Another end?') === 'y') {
//       end++;
//     } else {
//       game_over = true;
//     }
//   }

//   const results = players.map((scores, i) => {
//     const shot_percentage = scores.reduce((t, s) => t + (s / 10), 0) / scores.length * 100;
//     return [positions[i], ...scores, shot_percentage];
//   })

//   console.table(results)
  

//   rl.close();
// })()