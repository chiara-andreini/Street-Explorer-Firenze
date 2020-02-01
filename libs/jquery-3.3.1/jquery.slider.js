(function($){
    
    $.fn.slider = function(options){
        
        var defaults = {
            speed: 1000,
            pause: 2000,
            transition: "slide"
        }
        
        console.log("defaults.speed: " + defaults.speed);
        console.log("defaults.pause: " + defaults.pause);
        console.log("defaults.transition: " + defaults.transition);
        
        options = $.extend(defaults, options);
        
        if (options.pause <= options.speed){
            options.pause = options.speed + 100;
        }
        
        console.log("options.speed: " + options.speed);
        console.log("options.pause: " + options.pause);
        console.log("options.transition: " + options.transition);
        
        return this.each(function(){
            console.log("init instance");
            var $this = $(this);
            $this.wrap('<div class="slider-wrap" />');
            
            if(options.transition === 'slide'){
                $this.css({
                    'width': '9999px',
                    'position': 'relative',
                    'padding': 0
                });
                
                $this.children().css({
                    'float': 'left',
                    'listStyle': 'none'
                });
                
                $this.parent().css({
                    'width': $this.children().width(),
                    'overflow': 'hidden'
                });
                
                slide();
            }
            
            function slide(){
                console.log("init slide animation");
                setInterval(function(){
                    $this.animate(
                        {'left': '-' + $this.parent().width()},
                        options.speed,
                        function(){
                            $this.css('left', 0)
                                .children(":first")
                                .appendTo($this);
                        }
                    )
                }, options.pause)
            }
            
        });
        
        
    }
    
})(jQuery);