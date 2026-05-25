(function ($) {
  "use strict";

  var $nav = $("#mainNav");
  var scrollThreshold = 48;

  function updateNavbar() {
    if ($(window).scrollTop() > scrollThreshold) {
      $nav.addClass("scrolled");
    } else {
      $nav.removeClass("scrolled");
    }
  }

  function setActiveNav() {
    var scrollPos = $(window).scrollTop() + 100;
    $("#mainNav .nav-link[href^='#']").each(function () {
      var $link = $(this);
      var id = $link.attr("href");
      if (!id || id === "#") return;
      var $section = $(id);
      if (!$section.length) return;
      var top = $section.offset().top;
      var bottom = top + $section.outerHeight();
      if (scrollPos >= top && scrollPos < bottom) {
        $link.addClass("active");
      } else {
        $link.removeClass("active");
      }
    });
  }

  function initCounters() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      $(".stat-value").each(function () {
        var n = $(this).data("count");
        $(this).text(n + (n === 99 ? "%" : ""));
      });
      return;
    }

    var $stats = $(".stat-value");
    var started = false;

    function check() {
      if (started) return;
      var $first = $stats.first();
      if (!$first.length) {
        started = true;
        return;
      }
      var rect = $first[0].getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        started = true;
        $stats.each(function () {
          var $el = $(this);
          var target = parseInt($el.data("count"), 10) || 0;
          var suffix = target === 99 ? "%" : "";
          var start = 0;
          var duration = 1400;
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = Math.floor(start + (target - start) * eased);
            $el.text(val + suffix);
            if (p < 1) requestAnimationFrame(step);
            else $el.text(target + suffix);
          }
          requestAnimationFrame(step);
        });
      }
    }

    $(window).on("scroll.counter", check);
    check();
  }

  function revealOnScroll() {
    $(".fade-in").each(function () {
      var $el = $(this);
      if ($el.hasClass("visible")) return;
      var top = $el.offset().top;
      if (top < $(window).scrollTop() + $(window).height() * 0.88) {
        $el.addClass("visible");
      }
    });
  }

  function smoothScrollNav(e) {
    var href = $(this).attr("href");
    if (!href || href.charAt(0) !== "#") return;
    var $target = $(href);
    if (!$target.length) return;
    e.preventDefault();
    var offset = $nav.outerHeight() || 72;
    $("html, body").animate(
      {
        scrollTop: $target.offset().top - offset + 4,
      },
      550,
      "swing"
    );
    var $collapse = $("#navCollapse");
    if ($collapse.hasClass("show") && window.bootstrap) {
      var instance = bootstrap.Collapse.getInstance($collapse[0]);
      if (instance) instance.hide();
    }
  }

  $(document).ready(function () {
    $("#year").text(new Date().getFullYear());

    updateNavbar();
    setActiveNav();
    revealOnScroll();
    initCounters();

    $(window).on("scroll", function () {
      updateNavbar();
      setActiveNav();
      revealOnScroll();
    });

    $(window).on("resize", function () {
      setActiveNav();
    });

    $('#mainNav a.nav-link[href^="#"]').on("click", smoothScrollNav);
    $('.btn[href^="#"]').on("click", smoothScrollNav);

    $('a.internal-scroll[href^="#"]').on("click", smoothScrollNav);

    var $contactForm = $("#contactForm");
    if ($contactForm.length) {
      $contactForm.on("submit", function (e) {
        e.preventDefault();
        var form = this;
        var $form = $(form);
        var $status = $("#formStatus");
        var $btn = $("#submitBtn");

        if (!form.checkValidity()) {
          e.stopPropagation();
          $form.addClass("was-validated");
          $status.text("Please fix the highlighted fields.");
          return;
        }

        $form.removeClass("was-validated");
        $btn.prop("disabled", true);
        $status.removeClass("text-success text-danger").addClass("text-muted").text("Sending…");

        window.setTimeout(function () {
          $btn.prop("disabled", false);
          $status
            .removeClass("text-muted")
            .addClass("text-success")
            .text("Thanks — your message is ready to wire to email or a backend. Connect form action next.");
          form.reset();
        }, 900);
      });
    }
  });
})(jQuery);
