<?php
/*
Plugin Name: Scientific Calculator by Calculator.iO
Plugin URI: https://www.calculator.io/scientific-calculator/
Description: Solve complex math equations easily with our free online Scientific Calculator. Features advanced mathematical functions, trigonometry, logarithms, and more.
Version: 1.0.0
Author: www.calculator.io / Scientific Calculator
Author URI: https://www.calculator.io/
License: GPLv2 or later
Text Domain: calcio_scientific_calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Scientific Calculator by www.calculator.io";

function calcio_scientific_calculator_shortcode(){
    $page = 'index.html';
    return '<h2><img src="' . esc_url(plugins_url('assets/images/icon-48.png', __FILE__ )) . '" width="48" height="48">Scientific Calculator</h2><div><iframe style="background:transparent; overflow: scroll" src="' . esc_url(plugins_url($page, __FILE__ )) . '" width="100%" frameBorder="0" allowtransparency="true" onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + \'px\';" id="calcio_scientific_calculator_iframe"></iframe></div>';
}


add_shortcode( 'calcio_scientific_calculator', 'calcio_scientific_calculator_shortcode' );