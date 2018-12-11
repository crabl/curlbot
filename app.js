var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var express = require('express');
var MessagingResponse = require('twilio').twiml.MessagingResponse;
var bodyParser = require('body-parser');
var ejs = require('ejs');
var uuid = require('uuid');
var _ = require('lodash');
var app = express();
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
var TeamPosition;
(function (TeamPosition) {
    TeamPosition["Lead"] = "LEAD";
    TeamPosition["Second"] = "2ND";
    TeamPosition["Third"] = "3RD";
    TeamPosition["Skip"] = "SKIP";
})(TeamPosition || (TeamPosition = {}));
var POSITIONS = [
    TeamPosition.Lead,
    TeamPosition.Second,
    TeamPosition.Third,
    TeamPosition.Skip
];
function nextState(current_state) {
    var next_state = {
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
        var pos_index = POSITIONS.indexOf(current_state.position);
        next_state.position = POSITIONS[(pos_index + 1) % 4];
    }
    // calculate next rock number
    next_state.rock = current_state.rock % 2 + 1;
    return next_state;
}
var states = {
    '1ef7f9f4-80ec-4e7d-a4bc-549a22873157': {
        end: 1,
        position: TeamPosition.Lead,
        rock: 1,
        shots: []
    },
    '1d02fcaa-1748-4f4c-a94e-90af2cc8920f': {
        end: 7,
        position: TeamPosition.Lead,
        rock: 1,
        shots: [3, 5, 5, 0, 3, 4, 5, 3, 2, 1, 5, 0, 4, 3, 0, 2, 0, 1, 1, 1, 3, 0, 3, 4, 2, 4, 4, 4, 0, 2, 0, 4, 1, 3, 3, 4, 2, 1, 0, 1, 3, 0, 4, 4, 0, 5, 0, 0]
    }
};
function newGame() {
    var game_id = uuid.v4();
    states[game_id] = {
        end: 1,
        position: TeamPosition.Lead,
        rock: 1,
        shots: []
    };
    return game_id;
}
function computeShotTable(shots) {
    var ends = _.chunk(shots, 8);
    var positions = [
        [],
        [],
        [],
        []
    ];
    ends.forEach(function (end) { return _.chunk(end, 2).forEach(function (position, i) {
        positions[i] = positions[i].concat(position);
    }); });
    var percentages = positions.map(function (position) {
        return position.reduce(function (t, shot) { return t + (shot / 5); }, 0) / position.length * 100;
    });
    return {
        positions: positions,
        percentages: percentages
    };
}
app.get('/', function (req, res) {
    var game_id = newGame();
    return res.redirect(game_id);
});
app.get('/:game_id', function (req, res) {
    var game_id = req.params.game_id;
    var state = states[game_id];
    if (state) {
        return res.render('game', __assign({}, state, { game_id: game_id }));
    }
    res.send('no');
});
app.get('/:game_id/summary', function (req, res) {
    var game_id = req.params.game_id;
    var state = states[game_id];
    var _a = computeShotTable(state.shots || []), positions = _a.positions, percentages = _a.percentages;
    return res.render('summary', __assign({}, state, { game_id: game_id,
        positions: positions, position_names: POSITIONS, percentages: percentages }));
});
app.post('/:game_id', function (req, res) {
    var game_id = req.params.game_id;
    var state = states[game_id];
    states[game_id] = nextState(__assign({}, state, { shots: state.shots.concat(parseFloat(req.body.rating)) }));
    return res.send(states[game_id]);
});
var PORT = process.env.PORT || 8080;
console.log("curlbot listening on port " + PORT);
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
