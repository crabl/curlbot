const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const ejs = require('ejs');
const uuid = require('uuid');

const app = express();
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

enum TeamPosition {
  Lead = 'LEAD',
  Second = '2ND', 
  Third = '3RD', 
  Skip = 'SKIP'
}

const positions = [
  TeamPosition.Lead,
  TeamPosition.Second,
  TeamPosition.Third, 
  TeamPosition.Skip
];

interface Shot {
  position: TeamPosition;
  rock: number;
  rating: number;
}

interface GameState {
  end: number;
  position: TeamPosition;
  rock: number;
  shots: Shot[];
}

function nextState(current_state: GameState): GameState {
  let next_state = {
    end: current_state.end,
    position: current_state.position,
    rock: current_state.rock,
    shots: current_state.shots
  };

  if (current_state.rock === 2) {
    // if it's the skip's second rock, increment end number
    if (current_state.position === TeamPosition.Skip) {
      next_state.end = current_state.end + 1;
    }

    // rotaté
    const pos_index = positions.indexOf(current_state.position);
    next_state.position = positions[(pos_index + 1) % 4]; 
  }

  // calculate next rock number
  next_state.rock = current_state.rock % 2 + 1;

  return next_state;
}

const states = {
  '1ef7f9f4-80ec-4e7d-a4bc-549a22873157': {
    end: 1,
    position: TeamPosition.Lead,
    rock: 1
  }
}

app.get('/', (req, res) => {
  return res.render('index', {
    game_id: '1ef7f9f4-80ec-4e7d-a4bc-549a22873157'
  });
})

app.get('/:game_id', (req, res) => {
  const { game_id } = req.params;
  const state = states[game_id];
  console.log(state);
  
  return res.render('game', {
    ...state,
    game_id
  });
});

app.post('/:game_id', (req, res) => {
  const { game_id } = req.params;
  console.log(req.body);
  return res.send('OK')
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