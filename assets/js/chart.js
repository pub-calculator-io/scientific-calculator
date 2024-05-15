'use strict'

let theme = 'light';
if (localStorage.getItem('theme') === 'dark' || (localStorage.getItem('theme') === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) theme = 'dark';

Chart.defaults.borderColor = '#000';

const colors = {
	light: {
		purple: '#A78BFA',
		yellow: '#FBBF24',
		sky: '#7DD3FC',
		blue: '#1D4ED8',
		textColor: '#6B7280',
		yellowGradientStart: 'rgba(250, 219, 139, 0.33)',
		purpleGradientStart: 'rgba(104, 56, 248, 0.16)',
		skyGradientStart: 'rgba(56, 187, 248, 0.16)',
		tealGradientStart: 'rgba(56, 248, 222, 0.16)',
		yellowGradientStop: 'rgba(250, 219, 139, 0)',
		purpleGradientStop: 'rgba(104, 56, 248, 0)',
		gridColor: '#DBEAFE',
		tooltipBackground: '#fff',
		fractionColor: '#EDE9FE',
	},
	dark: {
		purple: '#7C3AED',
		yellow: '#D97706',
		sky: '#0284C7',
		blue: '#101E47',
		textColor: '#fff',
		yellowGradientStart: 'rgba(146, 123, 67, 0.23)',
		purpleGradientStart: 'rgba(78, 55, 144, 0.11)',
		skyGradientStart: 'rgba(56, 187, 248, 0.16)',
		tealGradientStart: 'rgba(56, 248, 222, 0.16)',
		yellowGradientStop: 'rgba(250, 219, 139, 0)',
		purpleGradientStop: 'rgba(104, 56, 248, 0)',
		gridColor: '#162B64',
		tooltipBackground: '#1C3782',
		fractionColor: '#41467D',
	},
};

class Custom extends LineController {
	draw() {
		super.draw(arguments);

		const ctx = this.chart.ctx;
		let _stroke = ctx.stroke;

		ctx.stroke = function () {
			ctx.save();
			ctx.shadowColor = 'black';
			ctx.shadowBlur = 20;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 20;
			_stroke.apply(this, arguments);
			ctx.restore();
		};
	}
}

Custom.id = 'shadowLine';
Custom.defaults = LineController.defaults;

Chart.register(Custom);

let switchTheme = []

if (document.getElementById('chartC150')) {
	let ctx = document.getElementById('chartC150').getContext('2d');

	let purpleGradient = ctx.createLinearGradient(0, 0, 2048, 0);
	purpleGradient.addColorStop(0, 'rgba(152, 96, 250, 0)');
	purpleGradient.addColorStop(1, 'rgba(152, 96, 250, .8)');

	const dataCharts = {
		labels: [0, 1, 2, 3, 4, 5, 6],
		datasets: [
			{
				label: 'D1',
				data: [{ x: 4, y: 40 }],
				backgroundColor: '#7C3AED',
				borderWidth: 0,
				radius: 6,
				hoverRadius: 6,
				type: 'scatter',
				stacked: true,
				order: 0,
			},
			{
				label: 'D2',
				data: [0, 10, 20, 40, 60, 80, 100],
				borderColor: colors[theme].purple,
				type: 'line',
				fill: '-1',
				order: 1,
				pointHoverRadius: 0,
			},
			{
				label: 'D3',
				data: [0, 5, 5, 15, 25, 35, 45],
				borderColor: colors[theme].purple,
				backgroundColor: purpleGradient,
				type: 'line',
				fill: '-1',
				order: 1,
				pointHoverRadius: 0,
			},
		],
	};

	let chart = new Chart(document.getElementById('chartC150'), {
		data: dataCharts,
		options: {
			stepSize: 1,
			response: true,
			elements: {
				point: {
					radius: 0,
				},
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: false,
			},
			interaction: {
				mode: 'index',
				intersect: false,
			},
			scales: {
				y: {
					max: 100,
					grid: {
						tickLength: 0,
						color: colors[theme].gridColor,
					},
					ticks: {
						display: false,
						stepSize: 25,
					},
					border: {
						color: colors[theme].gridColor,
					},
				},
				x: {
					stacked: false,
					border: {
						color: colors[theme].gridColor,
					},
					ticks: {
						display: false,
						color: colors[theme].gridColor,
						stepSize: 1,
					},
					grid: {
						tickLength: 0,
						color: colors[theme].gridColor,
					},
				},
			},
		},
	});

	let switchThemeChartC150 = function(theme) {
		let y = chart.config.options.scales.y
		let x = chart.config.options.scales.x
		let data = chart.config.data
		y.grid.color = colors[theme].gridColor;
		y.border.color = colors[theme].gridColor;
		x.border.color = colors[theme].gridColor;
		x.grid.color = colors[theme].gridColor;
		x.ticks.color = colors[theme].gridColor;
		data.datasets[1].borderColor = colors[theme].purple;
		data.datasets[2].borderColor = colors[theme].purple;
		chart.update()
	}

	switchTheme.push(switchThemeChartC150)

}