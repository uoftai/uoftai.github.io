function f1(t, b) {
	return Math.sin(4 * (t + pi / b));
}

function f2(t, a) {
	return Math.cos(2 * (t + pi / a));
}

function f3(t, a, b) {
	return 0.5 * Math.sin(2 * (t + pi / b)) - 0.5 * Math.cos(4 * (t - 2 * pi / b / a));
}

function g(t, a, b, c) {
	return Math.abs(f1(t + c, b)) + Math.abs(f2(t + 2 * c, a)) + Math.abs(f3(t + 3 * c, a, b)) + 0.0001;
}

function h(t, a, b, c) {
	return Math.abs(f1(t + 3 * c, b)) + Math.abs(f2(t + c, a)) + Math.abs(f3(t + 2 * c, a, b)) + 1;
}

function random(min, max) {
	return Math.random() * (max - min) + min;
}

// Converts implied coordinates into a set of full coordinates for
// both the handles and the points
function convert_bezier_proper(x_coords, y_coords, init_handle_x, init_handle_y) {
	let proper_x = [];
	let proper_y = [];

	proper_x.push(x_coords[x_coords.length - 1]);
	proper_x.push(2 * x_coords[x_coords.length - 1] - init_handle_x);
	proper_x.push(x_coords[0]);
	proper_x.push(x_coords[1]);

	proper_y.push(y_coords[y_coords.length - 1]);
	proper_y.push(2 * y_coords[y_coords.length - 1] - init_handle_y);
	proper_y.push(y_coords[0]);
	proper_y.push(y_coords[1]);

	for (let i = 2; i < x_coords.length - 2; i += 2) {
		proper_x.push(2 * x_coords[i - 1] - x_coords[i - 2]);
		proper_x.push(x_coords[i]);
		proper_x.push(x_coords[i + 1]);

		proper_y.push(2 * y_coords[i - 1] - y_coords[i - 2]);
		proper_y.push(y_coords[i]);
		proper_y.push(y_coords[i + 1]);
	}

	proper_x.push(2 * x_coords[x_coords.length - 3] - x_coords[x_coords.length - 4]);
	proper_x.push(init_handle_x);
	proper_x.push(x_coords[x_coords.length - 1]);

	proper_y.push(2 * y_coords[y_coords.length - 3] - y_coords[y_coords.length - 4]);
	proper_y.push(init_handle_y);
	proper_y.push(y_coords[y_coords.length - 1]);

	return [proper_x, proper_y]
}

function is_smooth(proper_x, proper_y) {
	for (let i = 0; i < proper_x.length - 3; i += 3) {
		let x2 = proper_x[i + 1];
		let x3 = proper_x[i + 2];
		let x4 = proper_x[i + 3];

		let y2 = proper_y[i + 1];
		let y3 = proper_y[i + 2];
		let y4 = proper_y[i + 3];

		let f32 = y3 / y2;
		let f42 = y4 / y2;

		let canonical_x = (x4 - x2 * f42) / (x3 - x2 * f32);
		let canonical_y = f42 + (1 - f32) * canonical_x;
		
		if (canonical_y >= 1) {
			continue;
		}

		if (canonical_x >= 1) {
			continue;
		}

		if (canonical_x <= 0) {
			if (canonical_y < (3 * canonical_x - Math.pow(canonical_x, 2)) / 3) {
				continue;
			} else {
				return false;
			}
		}

		if (canonical_y < (Math.pow(12 * canonical_x - 3 * Math.pow(canonical_x, 2), 0.5) - canonical_x) / 2) {
			continue;
		} else {
			return false;
		}
	}

	return true;
}

function get_g_scale() {
	if (window.innerWidth > 992) {
		return 0.026 * window.innerWidth;
	} else if (window.innerWidth <= 992 && window.innerWidth > 600) {
		return 0.05 * window.innerWidth;
	} 
	return 0.07 * window.innerWidth;
}

function get_h_scale() {
	if (window.innerWidth > 992) {
		return 0.015 * window.innerWidth;
	} else if (window.innerWidth <= 992 && window.innerWidth > 600) {
		return 0.027 * window.innerWidth;
	} 
	return 0.035 * window.innerWidth;
}

function get_star_scale() {
	if (window.innerWidth > 992) {
		return 0.007 * window.innerWidth;
	} else if (window.innerWidth <= 992 && window.innerWidth > 600) {
		return 0.012 * window.innerWidth;
	} 
	return 0.017 * window.innerWidth;
}

let MIN_POINTS = 4;
let MAX_POINTS = 7;
let H_SCALE = get_h_scale();
let G_SCALE = get_g_scale();

let pi = Math.PI;

function create_blob(c_x, c_y) {
	a = random(0.1, 0.7);
	b = random(0.1, 0.7);
	c = random(0, 2 * pi);

	let num_points = Math.floor(random(MIN_POINTS, MAX_POINTS)) * 2;

	// thetas
	let points = [];

	let interval_size = 2 * pi / num_points;

	for (let i = 0; i < num_points; i++) {
		points.push(random(interval_size * i, interval_size * (i + 1)));
	}

	// radius for thetas
	let r_points = [];

	for (let i = 0; i < num_points; i++) {
		if (i % 2 == 0) {
			r_points.push(H_SCALE * h(points[i], a, b, c));
		} else {
			r_points.push(G_SCALE * g(points[i], a, b, c));
		}
	}

	// cartesian coords
	let x_coords = [];
	let y_coords = [];

	for (let i = 0; i < num_points; i++) {
		x_coords.push(r_points[i] * Math.cos(points[i]));
		y_coords.push(r_points[i] * Math.sin(points[i]));
	}

	let init_handle_point = random(2 * (pi - interval_size), 2 * pi - interval_size);
	let init_handle = H_SCALE * h(init_handle_point, a, b, c);
	let init_handle_x = init_handle * Math.cos(init_handle_point);
	let init_handle_y = init_handle * Math.sin(init_handle_point);

	let path = 'M ' + (x_coords[x_coords.length - 1] + c_x) + ',' + (y_coords[y_coords.length - 1] + c_y) 
				+ ' C ' + (2 * x_coords[x_coords.length - 1] - init_handle_x + c_x) + ',' + (2 * y_coords[y_coords.length - 1] - init_handle_y + c_y)
				+ ' ' + (x_coords[0] + c_x) + ',' + (y_coords[0] + c_y)
				+ ' ' + (x_coords[1] + c_x) + ',' + (y_coords[1] + c_y);

	for (let i = 2; i < x_coords.length - 3; i += 2) {
		path += ' S ' + (x_coords[i] + c_x) + ',' + (y_coords[i] + c_y) + ' ' + (x_coords[i + 1] + c_x) + ',' + (y_coords[i + 1] + c_y);
	}

	// match the last handle with the first handle
	path += ' S ' + (init_handle_x + c_x) + ',' + (init_handle_y + c_y)
			+ ' ' + (x_coords[x_coords.length - 1] + c_x) + ',' + (y_coords[y_coords.length - 1] + c_y)

	let proper_xy = convert_bezier_proper(x_coords, y_coords, init_handle_x, init_handle_y);

	// let smooth = is_smooth(proper_xy[0], proper_xy[1]);

	// if (!smooth) {
	// 	return create_blob();
	// }
	
	return path;
}

let asteroids = [];
let asteroid_pos = [];

let viewbox = [window.innerWidth, $('.content').height()];
$('svg').attr('viewBox', '0 0 ' + viewbox[0] + ' ' + viewbox[1]);
let star_rad = get_star_scale();

let velo = [];
let rot = [];

let asteroid_scale = 0.02;

if ($('asteroid-scale').length) {
	asteroid_scale = parseFloat($('asteroid-scale').html());
}

if (window.innerWidth <= 992 && window.innerWidth > 600) {
	asteroid_scale *= 1.8;
} else if (window.innerWidth <= 600) {
	asteroid_scale *= 2.2;
}

let NUM_ASTEROIDS = asteroid_scale * window.innerWidth;
let AST_COLOURS = ['312C38', '322E38'];
let STAR_COLOURS = ['E3E0DB', 'D8D2C9']

function init() {
	for (let i = 0; i < NUM_ASTEROIDS / 1.8; i++) {
		$('#ast-container').html($('#ast-container').html() + '<path id="star' + i + '" d="M ' + random(star_rad * 2, viewbox[0] - star_rad * 2) + ',' + random(star_rad * 2, viewbox[1] - star_rad * 2) + ' l 0.001,0"'
			+ ' stroke-width="' + random(star_rad * 0.1, star_rad) + '" stroke-linecap="round" stroke="#' + STAR_COLOURS[Math.floor(random(0, STAR_COLOURS.length))] + '"></path>');
	}

	for (let i = 0; i < NUM_ASTEROIDS; i++) {
		$('#ast-container').html($('#ast-container').html() + '<path id="ast' + i + '" d="" fill="#' + AST_COLOURS[Math.floor(random(0, AST_COLOURS.length))] + '" fill-opacity="1"></path>');
		velo.push([random(0.0004 * viewbox[0], 0.001 * viewbox[0]), random(-0.0003 * viewbox[0], 0.0003 * viewbox[0])]);
		rot.push(random(-0.0004 * viewbox[0], 0.0004 * viewbox[0]))
	}

	for (let i = 0; i < NUM_ASTEROIDS; i++) {
		let c_x = random(-0.75 * viewbox[0], viewbox[0]);
		let c_y = random(0, viewbox[1]);
		asteroid_pos.push([c_x, c_y, random(0, 180)]);
		asteroids.push(create_blob(0, 0));
		$('#ast' + i).attr('transform', 'translate(' + asteroid_pos[i][0] + ',' + asteroid_pos[i][1] + ')'
			+ ' rotate(' + asteroid_pos[i][2] + ')');
		$('#ast' + i).attr('d', asteroids[i]);
	}	
}

function update() {
	if (viewbox[0] != window.innerWidth || viewbox[1] != $('.content').height()) {
		viewbox[0] = window.innerWidth;
		viewbox[1] = $('.content').height();
		$('svg').attr('viewBox', '0 0 ' + viewbox[0] + ' ' + viewbox[1]);
		H_SCALE = 0.015 * window.innerWidth;
		G_SCALE = 0.026 * window.innerWidth;
		star_rad = 0.01 * window.innerWidth;
	}

	for (let i = 0; i < NUM_ASTEROIDS; i++) {
		if (asteroid_pos[i][0] > viewbox[0] * 1.25) {
			let c_x = -0.3 * viewbox[0];
			let c_y = random(0, viewbox[1]);
			asteroid_pos[i] = [c_x, c_y, random(0, 180)];
			asteroids[i] = create_blob(0, 0);
			$('#ast' + i).attr('transform', 'translate(' + asteroid_pos[i][0] + ',' + asteroid_pos[i][1] + ')'
				+ ' rotate(' + asteroid_pos[i][2] + ')');
			$('#ast' + i).attr('d', asteroids[i]);
		}

		asteroid_pos[i][0] += velo[i][0];
		asteroid_pos[i][1] += velo[i][1];
		asteroid_pos[i][2] += rot[i];

		$('#ast' + i).attr('transform', 'translate(' + asteroid_pos[i][0] + ',' + asteroid_pos[i][1] + ')'
				+ ' rotate(' + asteroid_pos[i][2] + ')');
	}
}

init();

setInterval(update, 15);

$(window).scroll(function(){
    if ($(window).scrollTop() < 25 && $('.nav-wrapper').hasClass('nav-dark')) {
        $('.nav-wrapper').removeClass('nav-dark');
        $('.nav-wrapper').addClass('nav-dark-clear');
        $('nav').addClass('nav-no-shadow');
    }
    if ($(window).scrollTop() >= 25 && $('.nav-wrapper').hasClass('nav-dark-clear')) {
        $('.nav-wrapper').removeClass('nav-dark-clear');
        $('nav').removeClass('nav-no-shadow');
        $('.nav-wrapper').addClass('nav-dark');
    }
});

$(document).ready(function(){
	$('.sidenav').sidenav();

    $("a.scroll-link").click(function (event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: $($(this).attr("href")).offset().top - window.innerHeight / 6 }, 650);
    });
});