@@include('../../node_modules/jquery/dist/jquery.js');
@@include('../../node_modules/rateyo/src/jquery.rateyo.js');
@@include('../../node_modules/slick-carousel/slick/slick.js');
@@include('../../node_modules/mixitup/dist/mixitup.js');

$(function(){



  $(['.product-card__stars', '.testimonials__autor-stars']).rateYo({
    starWidth: "15px",
    normalFill: "#ccccce",
    ratedFill: "#ffc35b",
    readOnly: true,
    starSvg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16px" height="18px" viewBox="0 0 16 14" version="1.1"><g id="surface1"><path d="M 7.203125 0.488281 L 5.390625 4.105469 L 1.332031 4.6875 C 0.601562 4.792969 0.3125 5.675781 0.839844 6.183594 L 3.773438 9 L 3.082031 12.976562 C 2.957031 13.695312 3.726562 14.234375 4.371094 13.898438 L 8 12.019531 L 11.628906 13.898438 C 12.273438 14.234375 13.042969 13.695312 12.917969 12.976562 L 12.226562 9 L 15.160156 6.183594 C 15.6875 5.675781 15.398438 4.792969 14.667969 4.691406 L 10.609375 4.105469 L 8.796875 0.488281 C 8.472656 -0.160156 7.53125 -0.167969 7.203125 0.488281 Z M 7.203125 0.488281 " /></g></svg>'

    });


    $('.header-slider__slider').slick({
      fade: true,
      dots: false,
    });

    $('.testimonials__block').slick({
      fade: true,
      dots: true,
      arrows: false,
    });

    $('.header__button').on('click', function(){
      $('.header__button').toggleClass('header__button--active');
      $('.header__menu-list').toggleClass('header__menu-list--active');
    });

    $('.featured-products .popular-product__card-list').slick({
      slidesToShow: 3,
      dots:false,
      arrows: true,
      responsive: [
        {
          breakpoint: 1199,
          settings: {
            slidesToShow: 2,
          }
        },
        {
          breakpoint: 892,
          settings: {
            slidesToShow: 1,
          }
        }
      ],
    });

    var mixer = mixitup('.popular-product__card-list');

    // $(window).scroll(function() {
    //   if (this.scrollY > 12) {
    //     $('.header__menu').addClass('header__menu--sticky');
    //   } else {
    //     $('.header__menu').removeClass('header__menu--sticky');
    //   }
    // });

    let previouseScroll = 0;

    $(window).scroll(() => {
      let currentScroll = $(this).scrollTop();
      currentScroll > previouseScroll ? $(".header").addClass("header--sticky") : $(".header").removeClass("header--sticky");
      previouseScroll = currentScroll;
    })

});