(function (){
	var vars = [0, '0', [0], [],
			{}, '', null, [null], undefined, NaN, [NaN], 'a', Infinity, 1, '1',
			[1], true, false, 'true', 'false'
		],
		varNames = ["0", "'0'", "[0]",
			"[]", "{}", "''", "null", "[null]", "undefined", "NaN", "[NaN]",
			"'a'", "Infinity", "1", "'1'", "[1]", "true", "false", "'true'", 'false'
		],
		functions = [
			function(a,b) {
				return a == b;
			},
			function (a,b) {
				return a === b;
			},
			function (a,b) {
				return a + b;
			},
			function (a,b) {
				return a * b;
			}
		],
		functionNames = ['==', '===', '+', '*'],
		game = [],
		played = [],
		allAnswers = {},
		gameLength = 10,
		seconds = 20,
		timer,
		score = 0,
		roundNumber = 0;

	//some helper functions
	function rand(max) {
		return ~~(Math.random() * max);
	}

	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	//let's create one place with all answers
	functions.forEach(function (func, i) {
		allAnswers[functionNames[i]] = [];

		vars.forEach(function (vaA, j) {
			allAnswers[functionNames[i]].push([]);

			vars.forEach(function(vaB) {
				allAnswers[functionNames[i]][j].push(func(vaA, vaB))
			});
		})
	});

	function generateAnswers (comp, x, y) {
		if (['==', '==='].indexOf(comp) > -1) {
			return shuffle([
				[allAnswers[comp][x][y], true],
				[!allAnswers[comp][x][y], false]

			])
		} else if (comp === '*') {
			return shuffle([
				[NaN, isNaN(allAnswers[comp][x][y])],
				[Infinity, allAnswers[comp][x][y] === Infinity],
				[0, allAnswers[comp][x][y] === 0],
				[1, allAnswers[comp][x][y] === 1]
			]);
		} else {
			return shuffle([
				[allAnswers[comp][rand(vars.length - 1)][rand(vars.length - 1)], false],
				[allAnswers[comp][x][y], true],
				[allAnswers[comp][rand(vars.length - 1)][rand(vars.length - 1)], false],
				[allAnswers[comp][rand(vars.length - 1)][rand(vars.length - 1)], false]
			]);
		}
	}

	//generates game 'object'
	function generateGame() {
		var funcLength = functions.length - 1,
			varsLength = vars.length - 1;

		for(var i = 0; i < gameLength; i++) {
			game.push([rand(funcLength), rand(varsLength), rand(varsLength)]);
		}
	}

	function updateBar(now) {
		var percent = --now * (100 / gameLength);

		$('.progress-bar').width(percent + '%');
	}

	function startTimer () {
		$('.timer').text(seconds + ' sec left');

		timer = setInterval(function () {
			$('.timer').text(seconds-- + ' sec left');

			if (seconds <= -1) {
				clearInterval(timer);
				seconds = 0;
				showEndGame();
			}
		}, 1000);
	}

	function showEndGame() {
		$('.game').addClass('hidden');
		$('.game-end').removeClass('hidden');

		score = Math.min(10 * played.reduce(function(prev, current) {
			return prev + current;
		}, 0) + (20 - seconds), 100);

		$('.score').html('You scored: ' + score + '/' + 10 * gameLength);
	}

	function next() {
		var round = game[roundNumber++];

		updateBar(roundNumber);

		if (round) {
			var answers = generateAnswers(functionNames[round[0]], round[1], round[2]);

			$('.answer').html(answers.reduce(function(prev, answer) {
					return prev + '<button type="button" class="btn btn-default">' + answer[0] + '</button>'
				}, '')
			).find('.btn').each(function (i, btn){
				btn.theAnswer = answers[i][1];
				btn.innerHTML += ' ' + answers[i][1];
			});

			$('.a').text(varNames[round[1]]);
			$('.compare').text(functionNames[round[0]]);
			$('.b').text(varNames[round[2]]);
		} else {
			showEndGame();
		}
	}

	$(function () {
		$('.play-game').click(function () {
			$('.intro, .game-end').addClass('hidden');
			$('.game').removeClass('hidden');

			generateGame();

			roundNumber = 0;
			next();
			startTimer();
		});

		$('.answer').on('click', function (event) {
			played.push(event.target.theAnswer);
			next();
		});

		$('.share-button').click(function () {
			if (window.FB) {
				FB.ui({
					method: 'feed',
					link: 'http://watjs.olek.it',
					caption: 'I am terrible at JS with a score: ' + score + '/100'
				}, function(response){});
			}
		});
	});
})();
