/**
 * ENTR Technologies - 2026 Redesign
 * Core Interactions Script
 */

(function ($) {
  "use strict";

  // Preloader (if the #preloader div exists)
  $(window).on('load', function () {
    if ($('#preloader').length) {
      $('#preloader').delay(150).fadeOut('slow', function () {
        $(this).remove();
      });
    }
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  
  $('.back-to-top').click(function(){
    $('html, body').animate({scrollTop : 0}, 1200, 'easeInOutExpo');
    return false;
  });

  // Initiate the wowjs animation library
  if (typeof WOW !== 'undefined') {
    new WOW().init();
  }

  // Header scroll class
  $(window).scroll(function() {
    if ($(this).scrollTop() > 60) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  });

  if ($(window).scrollTop() > 60) {
    $('#header').addClass('header-scrolled');
  }

  // Smooth scroll for the navigation and links with .scrollto classes
  $('.main-nav a, .mobile-nav a, .scrollto').on('click', function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if (target.length) {
        var top_space = 0;

        if ($('#header').length) {
          top_space = $('#header').outerHeight();
          if (!$('#header').hasClass('header-scrolled')) {
            // Adjust for transition height difference
            top_space = top_space - 15;
          }
        }

        $('html, body').animate({
          scrollTop: target.offset().top - top_space
        }, 1200, 'easeInOutExpo');

        if ($(this).parents('.main-nav, .mobile-nav').length) {
          $('.main-nav .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('fa-times fa-bars');
          $('.mobile-nav-overly').fadeOut();
        }
        return false;
      }
    }
  });

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.main-nav, .mobile-nav');
  var main_nav_height = $('#header').outerHeight();

  $(window).on('scroll', function () {
    var cur_pos = $(this).scrollTop();
  
    nav_sections.each(function() {
      var top = $(this).offset().top - main_nav_height - 20,
          bottom = top + $(this).outerHeight();
  
      if (cur_pos >= top && cur_pos <= bottom) {
        main_nav.find('li').removeClass('active');
        main_nav.find('a[href="#'+$(this).attr('id')+'"]').parent('li').addClass('active');
      }
    });
  });

  // CounterUp integration for statistics cards
  if ($.fn.counterUp) {
    $('[data-toggle="counter-up"]').counterUp({
      delay: 10,
      time: 1000
    });
  }

  // 3D Card Tilt Interaction (Premium Micro-interaction)
  $(document).ready(function() {
    const isMobile = window.matchMedia("(max-width: 991px)").matches;
    
    // Only enable 3D tilt on desktops for better performance and usability
    if (!isMobile) {
      $('.glass-panel').each(function() {
        const card = $(this);
        
        card.on('mousemove', function(e) {
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left; // x coordinate within the element
          const y = e.clientY - rect.top;  // y coordinate within the element
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Calculate rotation values (-10deg to 10deg)
          const rotateX = ((centerY - y) / centerY) * 8; 
          const rotateY = ((x - centerX) / centerX) * 8;
          
          card.css({
            'transform': `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`,
            'box-shadow': '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(0, 110, 255, 0.15)',
            'border-color': 'rgba(255, 255, 255, 0.2)'
          });
        });
        
        card.on('mouseleave', function() {
          card.css({
            'transform': 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
            'box-shadow': '',
            'border-color': ''
          });
        });
      });
    }
  });

})(jQuery);
