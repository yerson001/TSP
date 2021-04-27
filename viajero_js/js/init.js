//var UI = UI || {};

//UI.init = function() {
var gaRunning = false,
	elements = [],
	citiNum = 0;

// DOM elements
canvas = document.getElementById('canvas'),
	startBtn = document.getElementById('start'),
	generationText = document.getElementById('generation'),
	distanceText = document.getElementById('distance'),
	plus10 = document.getElementById('plus10'),
	ctx = canvas.getContext('2d'),

	plus10.addEventListener('click', function () {
		var rect = canvas.getBoundingClientRect(),
			x, y;

		for (var i = 0; i < 10; i++) {
			x = Math.random() * (rect.width - 100) + 10 | 0;
			y = Math.random() * (rect.height - 40) + 35 | 0;

			add_city(x, y);
		}
	});

canvas.addEventListener('click', function (e) {
	var rect = canvas.getBoundingClientRect(),
		x = e.pageX - rect.left | 0,
		y = e.pageY - rect.top | 0;

	draw_city(x, y);
	elements.push(new City(x, y));
});

startBtn.addEventListener('click', function () {
	if (elements.length < 2) {
		alert('Please draw at least 2 cities');
		return;
	}
	if (gaRunning = !gaRunning) {
		TSP.initialize(elements, output_results);

		(function draw() {
			setTimeout(function () {
				if (gaRunning) {
					window.requestAnimationFrame(draw);
					TSP.nextGeneration();
				}
			}, 10);
		})();
	}
});

function add_city(x, y) {
	draw_city(x, y);
	elements.push(new City(x, y));
}

function draw_city(x, y) {
	ctx.beginPath();
	ctx.arc(x, y, 10, 0, Math.PI * 2, true);
	ctx.fillStyle = 'red';
	ctx.fill();
	ctx.stroke();
}

function draw_path(city1, city2, color) {
	if (color == 1) {
		ctx.strokeStyle = '#77777a';
	} else {
		ctx.strokeStyle = '#1e34d9';
	}
	ctx.beginPath();
	ctx.moveTo(city1.getX(), city1.getY());
	ctx.lineTo(city2.getX(), city2.getY());
	ctx.closePath();
	if (color == 1) {
		ctx.lineWidth = .5;
	} else {
		ctx.lineWidth = 3;
	}
	ctx.stroke();
}

function redraw_cities() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	citiNum = 0;
	for (var i = 0; i < elements.length; i++) {
		draw_city(elements[i].getX(), elements[i].getY());
	}
}

function output_results(generationNr, route, distance) {
	redraw_cities();
	allpath();
	generationText.innerText = generationNr;
	for (var i = 0; i < route.length - 1; i++) {
		draw_path(elements[route[i]], elements[route[i + 1]], 2);
	}
	// Connect last and first city
	draw_path(elements[route[0]], elements[route[i]], 2);
	distanceText.innerText = distance.toFixed(2);
}
function allpath() {
	for (var i = 0; i < elements.length; ++i) {
		for (var j = 0; j < elements.length; ++j) {
			draw_path(elements[i], elements[j], 1);
		}
	}
}

