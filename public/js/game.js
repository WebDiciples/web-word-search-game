const game_container = document.querySelector(".game_container"),
	grid_container = document.querySelector(".grid_container"),
	words_container = document.querySelector(".words"),
	validator_ui = document.querySelector(".validator_ui"),
	category_cards = document.querySelector(".category_cards"),
	start_game_btn = document.querySelector("#start_game_btn"),
	setting_btn = document.querySelector("#setting_btn"),
	setting_body = document.querySelector(".setting_body"),
	options_btns = document.querySelectorAll(".setting_mid_head button"),
	music_select_btns = document.querySelectorAll(".options input"),
	difficulty_select_btns = document.querySelectorAll(".difficulty input"),
	languages_select_btns = document.querySelectorAll(".languages input"),
	close_dialog = document.querySelector(".close_dialog"),
	splash_screen = document.querySelector(".splash_screen"),
	start_screen = document.querySelector(".start_screen"),
	category_screen = document.querySelector(".category_screen"),
	quit_categories_btn = document.querySelector(".quit_categories"),
	quit_game_btn = document.querySelector(".quit_game"),
	current_category = document.querySelector(".current_category"),
	setting_popup = document.querySelector("#settings");

const letter_arr = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
	"m",
	"n",
	"o",
	"p",
	"q",
	"r",
	"s",
	"t",
	"u",
	"v",
	"w",
	"x",
	"y",
	"z",
];

const sounds = ["bubble-1.mp3", "bubble-2.mp3"];

const directions = [
	[0, 1], // Horizontal
	[1, 0], // Vertical
	[1, 1], // Diagonal
	[-1, 1], // Reverse diagonal
	[0, -1], // Horizontal (reverse)
	[-1, 0], // Vertical (reverse)
	[-1, -1], // Diagonal (reverse)
	[1, -1], // Reverse diagonal (reverse)
];

let grid;
let max_words;
let grid_size; // Define the grid size

let max_attempts;
let attempts;

let is_dragging = false; // Track whether the mouse button is pressed

let selected_cells = []; // Store coordinates of selected cells
let selected_word = ""; // Store the current word being formed
let placed_words = [];
let found_words = [];

let start_cell = null;

let hue = 10;

let game_data = JSON.parse(localStorage.getItem("game_data")) || {
	music: true,
	sound: true,
	difficulty: "normal",
	language: "english",
};

let can_play_music = game_data.music;
let can_play_sound = game_data.sound;
let mute = false;

active_screen("active_screen", start_screen);

function play_sound(params) {
	let sound = new Audio(`public/assets/music/${params}`);
	sound.volume = 0.5;
	if (can_play_sound === true && mute === false) {
		sound.play();
	}
	console.log(can_play_sound);
}

function play_drag_sound() {
	let current_sound = sounds[Math.floor(sounds.length * Math.random())];
	let sound = new Audio(`public/assets/music/${current_sound}`);
	sound.volume = 0.5;
	if (can_play_sound === true && mute === false) sound.play();
}

function play_music(params) {
	let music = new Audio(`public/assets/music/${params}`);
	music.volume = 0.8;
	music.loop = true;
	console.log(can_play_music);
	if (can_play_music == true && mute == false) {
		music.play();
	} else {
		music.pause();
	}
}

play_music("bg_loop.mp3");

function start_game(param) {
	let category;
	active_screen("active_screen", game_container);

	reset_game();

	grid_container.innerHTML = ""; // Réinitialiser la grille

	try {
		category = param.getAttribute("data-name");
	} catch (error) {
		category = param;
	}

	setup_game(game_data.difficulty, category);
	current_category.textContent = category;

	console.log(category);
}

function render_category() {
	category_cards.innerHTML = "";
	fetch("./public/json/categories.json")
		.then((data) => data.json())
		.then((responses) => {
			for (const res in responses) {
				if (Object.hasOwnProperty.call(responses, res)) {
					const element = responses[res];
					category_cards.innerHTML += `
								<div class="category_card" data-name="${element.name}" style="background: ${element.bg_gradient};" onclick="start_game(this)">
									<i class="${element.image}"
										class="category_icon"></i>
									<b class="category_name">${element.name}</b>
								</div>`;
				}
			}
		});
}

render_category();

function active_screen(css_class, screen) {
	document.querySelector(`.${css_class}`).classList.remove(css_class);
	screen.classList.add(css_class);
}

start_game_btn.addEventListener("click", () => {
	play_sound("click.wav");
	active_screen("active_screen", category_screen);
});

quit_categories_btn.addEventListener("click", () => {
	play_sound("click.wav");
	active_screen("active_screen", start_screen);
});

quit_game_btn.addEventListener("click", () => {
	play_sound("click.wav");
	active_screen("active_screen", start_screen);
});

setting_btn.addEventListener("click", () => {
	play_sound("click.wav");
	setting_popup.showModal();
});

close_dialog.addEventListener("click", () => {
	play_sound("click.wav");
	setting_popup.close();
});

options_btns.forEach((btn) => {
	btn.addEventListener("click", () => {
		document.querySelector(".active_btn").classList.remove("active_btn");
		btn.classList.add("active_btn");
		play_sound("click.wav");
		switch (btn.id) {
			case "options":
				setting_body.style.justifyContent = "start";
				break;
			case "difficulty":
				setting_body.style.justifyContent = "center";
				break;
			case "languages":
				setting_body.style.justifyContent = "end";
				break;

			default:
				alert("It's seem something went wrong! Try reload your tab.");
				break;
		}
	});
});

music_select_btns.forEach((input) => {
	input.addEventListener("click", () => {
		play_sound("click.wav");

		switch (input.id) {
			case "music":
				game_data.music = input.checked;
				break;
			case "sounds_effect":
				game_data.sound = input.checked;
				break;
		}
		localStorage.setItem("game_data", JSON.stringify(game_data));
	});

	if (input.id == "music") {
		input.checked = can_play_music;
	} else if (input.id == "sounds_effect") {
		input.checked = can_play_sound;
	}
});

difficulty_select_btns.forEach((input) => {
	input.addEventListener("click", () => {
		play_sound("click.wav");

		switch (input.id) {
			case "easy":
				game_data.difficulty = input.id;
				break;
			case "normal":
				game_data.difficulty = input.id;
				break;
			case "hard":
				game_data.difficulty = input.id;
				break;
			case "expert":
				game_data.difficulty = input.id;
				break;
		}
		localStorage.setItem("game_data", JSON.stringify(game_data));
	});

	if (input.id == game_data.difficulty) {
		input.checked = true;
	}
});

languages_select_btns.forEach((input) => {
	input.addEventListener("click", () => {
		play_sound("click.wav");

		switch (input.id) {
			case "english":
				game_data.language = input.id;
				break;
			case "french":
				game_data.language = input.id;
				break;
			case "spanish":
				game_data.language = input.id;
				break;
		}
		localStorage.setItem("game_data", JSON.stringify(game_data));
	});

	if (input.id == game_data.language) {
		input.checked = true;
	}
});

async function setup_game(difficulty, category_name) {
	switch (difficulty) {
		case "easy":
			grid_size = 8;
			max_words = 30;
			max_attempts = 1000;
			grid_container.id = difficulty;
			break;
		case "normal":
			grid_size = 10;
			max_words = 90;
			max_attempts = 1000;
			grid_container.id = difficulty;
			break;
		case "hard":
			grid_size = 12;
			max_words = 100;
			max_attempts = 1500;
			grid_container.id = difficulty;
			break;
		case "extreme":
			grid_size = 13;
			max_words = 100;
			max_attempts = 1500;
			grid_container.id = difficulty;
			break;

		default:
			if (confirm("Something went wrong ,Please retry!")) {
				window.location.reload();
			}
			break;
	}

	grid = Array.from({ length: grid_size }, () => Array(grid_size).fill(""));

	const categories = await load_categories();
	const selected_category = categories[category_name];
	const words = select_words(selected_category.words, max_words);

	place_words(grid, words);
	render_grid(grid); // Afficher la grille
}

function place_words(grid, words) {
	const rows = grid.length;
	const cols = grid[0].length;

	for (const word of words) {
		let placed = false;

		// Try placing the word in different positions and directions
		for (let attempts = 0; attempts < max_attempts && !placed; attempts++) {
			const start_row = Math.floor(Math.random() * rows);
			const start_col = Math.floor(Math.random() * cols);
			const direction = Math.floor(Math.random() * directions.length);

			if (can_place_word(grid, word, start_row, start_col, direction)) {
				place_word(grid, word, start_row, start_col, direction);
				placed = true;
				placed_words.push(word); // Save the placed word
			}
		}
	}

	return placed_words; // Return the list of words placed in the grid
}

function reset_game() {
	found_words = [];
	placed_words = [];
	grid_container.innerHTML = "";
	validator_ui.value = "";
	render_word_arr();
}

function can_place_word(grid, word, start_row, start_col, direction) {
	const rows = grid.length;
	const cols = grid[0].length;
	const [d_row, d_col] = directions[direction]; // Get movement offsets

	for (let i = 0; i < word.length; i++) {
		const row = start_row + i * d_row;
		const col = start_col + i * d_col;

		// Check bounds
		if (row < 0 || row >= rows || col < 0 || col >= cols) {
			return false;
		}

		// Check if the cell is empty or matches the word's letter
		if (grid[row][col] !== "" && grid[row][col] !== word[i]) {
			return false;
		}
	}

	return true; // The word can be placed
}

function place_word(grid, word, start_row, start_col, direction) {
	const [d_row, d_col] = directions[direction]; // Get movement offsets

	for (let i = 0; i < word.length; i++) {
		const row = start_row + i * d_row;
		const col = start_col + i * d_col;

		// Place the letter only if the cell is empty
		if (grid[row][col] === "") {
			grid[row][col] = word[i];
		}
	}
}

function select_words(categoryWords, maxWords) {
	const shuffled = [...categoryWords];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)); 
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled.slice(0, maxWords);
}

async function load_categories() {
	try {
		const response = await fetch("public/json/categories.json");
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}

// // Render grid on the page
function render_word_arr() {
	const sorted_words = placed_words.sort();
	words_container.innerHTML = ""; // Clear the container

	sorted_words.forEach((word) => {
		// Check if the word is in the found_words array
		const css_class = found_words.includes(word) ? "found" : "";

		// Render each word with the appropriate class
		words_container.innerHTML += `<li class="word ${css_class}">${word}</li>`;
	});
}

// // Render grid on the page
function render_grid(param) {
	for (let index = 0; index < grid_size * grid_size; index++) {
		if (index < grid_size) {
			param[index].map((letter) => {
				const cell = document.createElement("div");
				const letter_cont = document.createElement("p");

				letter_cont.classList.add("letter_cont");
				letter_cont.setAttribute("role", "letter_cont");

				cell.classList.add("grid-cell", "circle");
				cell.setAttribute("role", "gridcell");

				if (letter == "") {
					// letter = letter_arr[Math.floor(letter_arr.length * Math.random())];
				}

				letter_cont.textContent = letter; // It's purely optional for the ui the line show on top the letter.you can remove the line to fix it
				cell.setAttribute("aria-label", `Letter ${cell.textContent}`);
				cell.append(letter_cont);
				grid_container.append(cell);
			});
		}
	}
	set_index();
	render_word_arr("");
}

function set_indicator(param) {
	const indicator = document.createElement("div");
	indicator.classList.add("indicator");
	param.append(indicator);
}

function set_index() {
	const cell_for_index = document.querySelectorAll(".grid-cell");
	cell_for_index.forEach((cell, index) => {
		cell.dataset.index = index;
	});
}

function is_valid_direction(dx, dy) {
	return directions.some(([dirX, dirY]) => dirX === dx && dirY === dy);
}

function calculate_direction(startIndex, endIndex) {
	const startRow = Math.floor(startIndex / grid_size);
	const startCol = startIndex % grid_size;
	const endRow = Math.floor(endIndex / grid_size);
	const endCol = endIndex % grid_size;

	const dx = endCol - startCol;
	const dy = endRow - startRow;

	const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
	const factor = gcd(Math.abs(dx), Math.abs(dy));

	return [dx / factor, dy / factor];
}

function update_selected_cells(startIndex, endIndex) {
	selected_cells.forEach((cell) => {
		cell.classList.remove("selected");
		cell.lastChild.remove();
	});
	selected_cells = [];

	const [dx, dy] = calculate_direction(startIndex, endIndex);
	let [currentRow, currentCol] = [
		Math.floor(startIndex / grid_size),
		startIndex % grid_size,
	];

	while (
		currentRow >= 0 &&
		currentRow < grid_size &&
		currentCol >= 0 &&
		currentCol < grid_size
	) {
		const currentIndex = currentRow * grid_size + currentCol;
		const cell = document.querySelector(`[data-index="${currentIndex}"]`);
		if (cell) {
			selected_cells.push(cell);
			cell.classList.add("selected");
			set_indicator(cell);
		}

		if (currentIndex === endIndex) break;

		currentRow += dy;
		currentCol += dx;
	}
}

function validate_word() {
	const word = validator_ui.value;

	if (!found_words.includes(word)) {
		// Avoid duplicate words
		found_words.push(word);
	}

	// Update the UI with all found words
	render_word_arr();

	// Check if all words have been found
	const all_found = placed_words.every((placed_word) =>
		found_words.includes(placed_word),
	);

	if (all_found) {
		if (confirm("You Win!!!! Next.")) {
			start_game(current_category.textContent);
		}
	}

	return placed_words.includes(word);
}

////////////////////////// MOUSE CONTROLL //////////////////////////
// Mouse down event
grid_container.addEventListener("mousedown", (e) => {
	if (e.target.classList.contains("grid-cell")) {
		start_cell = e.target;
		play_drag_sound();
		start_cell.setAttribute("aria-selected", "true");
		selected_cells.push(start_cell);
		start_cell.classList.add("selected");
		set_indicator(start_cell);
	}
});

// Mouse move event
grid_container.addEventListener("mousemove", (e) => {
	if (start_cell) {
		const endCell = document.elementFromPoint(e.clientX, e.clientY);
		if (endCell && endCell.classList.contains("grid-cell")) {
			const startIndex = parseInt(start_cell.dataset.index);
			const endIndex = parseInt(endCell.dataset.index);

			const [dx, dy] = calculate_direction(startIndex, endIndex);

			if (is_valid_direction(dx, dy)) {
				validator_ui.value = selected_cells
					.map((cell) => cell.textContent)
					.join("");
				play_drag_sound();

				update_selected_cells(startIndex, endIndex);
			}
		}
	}
});

// Mouse up event
grid_container.addEventListener("mouseup", () => {
	if (start_cell) {
		if (validate_word()) {
			hue = Math.floor(Math.random() * 354);
			validator_ui.style.color = "lime";

			setTimeout(() => {
				validator_ui.style.color = "#2b2b2b";
				validator_ui.value = "";
			}, 1500);

			if (hue > 354) {
				hue = 50;
			}

			selected_cells.forEach((cell) => {
				cell.classList.add("valid");
				cell.style = `--hue: ${hue}`;
				cell.classList.remove("selected");

				console.log(cell);
			});
		} else {
			validator_ui.style.color = "crimson";

			setTimeout(() => {
				validator_ui.style.color = "#2b2b2b";
				validator_ui.value = "";
			}, 1500);

			selected_cells.forEach((cell) => {
				cell.classList.remove("selected");
				cell.lastChild.remove();
			});
		}

		// Reset for the next selection
		start_cell = null;
		selected_cells = [];
	}
});
