import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, ArrowRight, Mail, Phone, MapPin, 
  CheckCircle, AlertCircle, Loader2, Instagram, Linkedin, Twitter, 
  Camera, Film, Image as ImageIcon, Clapperboard, Play, ArrowUp,
  Heart, Coffee, MousePointer2, User
} from 'lucide-react';

// --- Global Styles & noise texture ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200..900;1,200..900&family=Lato:wght@300;400;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap'); /* For handwritten text */

    :root {
      --color-navy: #1B3B5A;
      --color-orange: #FF6B35;
      --color-cream: #FFF8F3;
      --color-paper: #FFFDF9;
      --cursor-size: 20px;
    }

    html { scroll-behavior: smooth; }
    
    body {
      font-family: 'Lato', sans-serif;
      background-color: var(--color-cream);
      color: var(--color-navy);
      cursor: none; /* Hide default cursor for custom one */
    }

    a, button, input, textarea, .cursor-pointer {
      cursor: none; /* Ensure custom cursor works on interactive elements */
    }

    h1, h2, h3, h4, h5, h6, .font-serif {
      font-family: 'Crimson Pro', serif;
    }

    .font-hand {
      font-family: 'Caveat', cursive;
    }

    /* Noise texture for that "paper" feel */
    .bg-texture {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.4;
      filter: contrast(320%) brightness(100%);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* Mandala Patterns */
    .mandala-bg {
        position: absolute;
        background-repeat: no-repeat;
        background-size: contain;
        opacity: 0.15;
        pointer-events: none;
        z-index: -1;
        transition: transform 0.1s ease-out; /* For parallax */
    }

    /* Custom utilities */
    .text-navy { color: var(--color-navy); }
    .bg-navy { background-color: var(--color-navy); }
    .text-orange { color: var(--color-orange); }
    .bg-orange { background-color: var(--color-orange); }
    
    .tape {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%) rotate(-2deg);
      width: 100px;
      height: 30px;
      background-color: rgba(255, 255, 255, 0.6);
      opacity: 0.8;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Custom Cursor */
    .custom-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: var(--cursor-size);
        height: var(--cursor-size);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.2s ease, width 0.2s ease, height 0.2s ease, background-color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .custom-cursor.hovering {
        transform: scale(2.5);
        background-color: rgba(255, 107, 53, 0.2); /* Orange tint on hover */
        border: none;
    }
    .custom-cursor-dot {
        width: 8px;
        height: 8px;
        background-color: var(--color-orange);
        border-radius: 50%;
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 10000;
    }

    /* Scroll Progress Bar */
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: transparent;
        z-index: 100;
    }
    .scroll-progress-bar {
        height: 100%;
        background: var(--color-orange);
        width: 0%;
        transition: width 0.1s;
    }

    /* Magnetic Button Effect */
    .magnetic-btn {
        transition: transform 0.2s cubic-bezier(0.33, 1, 0.68, 1);
    }

    /* Fade In Up Animation */
    .fade-in-up {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .fade-in-up.visible {
        opacity: 1;
        transform: translateY(0);
    }

    /* Preloader */
    .preloader {
        position: fixed;
        inset: 0;
        background-color: var(--color-cream);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
    }
    .preloader.hidden {
        opacity: 0;
        visibility: hidden;
    }

  `}</style>
);

// --- Hooks ---
const useScrollSpy = (ids, offset = 100) => {
  const [activeId, setActiveId] = useState('');
  useEffect(() => {
    const listener = () => {
      const scrollPosition = window.scrollY + offset;
      let newActiveId = '';
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
          if (scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
            newActiveId = id;
          }
        }
      }
      setActiveId(newActiveId);
    };
    window.addEventListener('scroll', listener);
    listener();
    return () => window.removeEventListener('scroll', listener);
  }, [ids, offset]);
  return activeId;
};

const useParallax = (speed = 0.1) => {
    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const handleScroll = () => setOffset(window.pageYOffset * speed);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);
    return offset;
};

const useIntersectionObserver = (options) => {
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, [containerRef, options]);

    return [containerRef, isVisible];
};

// --- Components ---

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            if (cursorRef.current && dotRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`;
                dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
            }
        };

        const handleMouseOver = (e) => {
             if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' || e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('cursor-pointer')) {
                cursorRef.current.classList.add('hovering');
            } else {
                cursorRef.current.classList.remove('hovering');
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            <div ref={cursorRef} className="custom-cursor border-2 border-orange opacity-50 hidden md:flex"></div>
            <div ref={dotRef} className="custom-cursor-dot hidden md:block"></div>
        </>
    );
};

const Preloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000); // Simulate load time
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`preloader ${!loading ? 'hidden' : ''}`}>
            <div className="text-center animate-pulse">
                <Logo size="text-6xl" />
                <div className="mt-4 flex justify-center">
                     <Loader2 className="animate-spin text-orange" />
                </div>
            </div>
        </div>
    )
}

const ScrollProgress = () => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setWidth(progress);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="scroll-progress">
            <div className="scroll-progress-bar" style={{ width: `${width}%` }}></div>
        </div>
    );
};


const Logo = ({ size = 'text-4xl md:text-5xl' }) => (
    <span className={`font-serif ${size} font-bold text-navy relative inline-flex items-center`}>
        <span className="text-orange transform -rotate-12 mr-1 relative top-1" style={{fontFamily: "'Caveat', cursive", fontSize: '1.4em'}}>V</span>
        Films
    </span>
);

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSection = useScrollSpy(['home', 'stories', 'services', 'contact']);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'Their Stories', href: '#work', id: 'work' },
    { name: 'Our Story', href: '#about', id: 'about' },
    { name: 'Varnan', href: '#home', id: 'home' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#FFF8F3]/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        <a href="#home" className="flex items-center group">
          <Logo size="text-3xl" />
        </a>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium text-navy/70 hover:text-navy transition-colors relative group ${activeSection === link.id ? 'text-navy font-semibold' : ''}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all duration-300 group-hover:w-full ${activeSection === link.id ? 'w-full' : ''}`}></span>
            </a>
          ))}
          <MagneticButton className="bg-orange text-white px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-navy transition-all shadow-md hover:shadow-lg" href="#contact">
              Let's Talk <Mail size={16} />
          </MagneticButton>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-navy p-2 z-50 relative" aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Full Screen Mobile Nav */}
      <div className={`md:hidden fixed inset-0 bg-[#FFF8F3] z-40 flex flex-col items-center justify-center space-y-8 transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
         <Mandala className="w-[150%] h-[150%] opacity-5 animate-spin-slow" />
        {navLinks.map((link, index) => (
          <a 
            key={link.name} 
            href={link.href} 
            onClick={() => setIsOpen(false)} 
            className="text-navy font-serif text-4xl font-bold relative overflow-hidden group"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <span className="relative z-10">{link.name}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-orange/20 -z-10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </a>
        ))}
      </div>
    </nav>
  );
};

const MagneticButton = ({ children, className, href, onClick, type, disabled }) => {
    const btnRef = useRef(null);

    useEffect(() => {
        const btn = btnRef.current;
        if (!btn) return;

        const handleMouseMove = (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        };

        const handleMouseLeave = () => {
            btn.style.transform = 'translate(0px, 0px)';
        };

        btn.addEventListener('mousemove', handleMouseMove);
        btn.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            btn.removeEventListener('mousemove', handleMouseMove);
            btn.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    if (href) {
        return <a ref={btnRef} href={href} className={`magnetic-btn inline-block ${className}`}>{children}</a>;
    }
    
    // Determine if children is a button element, this is a fallback if needed
    const isButtonChild = React.isValidElement(children) && children.type === 'button';

    if (isButtonChild) {
         return React.cloneElement(children, {
            ref: (node) => {
                btnRef.current = node;
                const { ref } = children;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            className: `magnetic-btn ${className || ''} ${children.props.className || ''}`,
         });
    }


    return <button ref={btnRef} onClick={onClick} type={type} disabled={disabled} className={`magnetic-btn ${className}`}>{children}</button>;
};

const Mandala = ({ className, style }) => (
    <div className={`mandala-bg ${className}`} style={style}>
        <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-none stroke-orange" strokeWidth="0.5">
            <circle cx="250" cy="250" r="200" />
            <circle cx="250" cy="250" r="150" />
            <circle cx="250" cy="250" r="100" />
            <circle cx="250" cy="250" r="50" />
            {[...Array(12)].map((_, i) => (
                <path key={i} d={`M250 250 L${250 + 200 * Math.cos(i * Math.PI / 6)} ${250 + 200 * Math.sin(i * Math.PI / 6)}`} transform={`rotate(${i * 30} 250 250)`} />
            ))}
            {[...Array(24)].map((_, i) => (
                 <path key={`p2-${i}`} d="M250 50 Q 280 100, 250 150 Q 220 100, 250 50" transform={`rotate(${i * 15} 250 250)`} />
            ))}
        </svg>
    </div>
)

const Hero = () => {
    const parallaxOffset = useParallax(0.2);

    return (
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <Mandala className="w-[800px] h-[800px] -left-[400px] top-1/2 -translate-y-1/2 opacity-10" style={{ transform: `translateY(${parallaxOffset}px)` }} />
    
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-center z-10">
            <div className="md:col-span-2 flex justify-center md:justify-end animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                 <Logo size="text-8xl md:text-9xl" />
            </div>
    
            <div className="md:col-span-3 text-center md:text-left space-y-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                 <h1 className="font-serif text-5xl md:text-7xl text-navy leading-tight font-normal">
                    <span className="font-hand text-6xl md:text-8xl text-navy mr-4">Varnan</span>
                    is where stories find <br className="hidden md:block"/> their
                    <span className="italic ml-4 relative inline-block">
                        voice and form
                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange/30" viewBox="0 0 200 20" preserveAspectRatio="none">
                            <path d="M5,15 Q50,5 95,15 T185,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>
                
                <div className="flex items-center justify-center md:justify-start gap-3 text-orange text-xl md:text-2xl font-light">
                    <span>Films</span>
                    <span className="text-orange/40">.</span>
                    <span>Brands</span>
                     <span className="text-orange/40">.</span>
                    <span>Art</span>
                </div>
    
                <p className="text-navy/70 text-sm md:text-base leading-relaxed max-w-lg mx-auto md:mx-0 font-light tracking-wide">
                    Since 2009, we've been telling stories - stories of people, their journeys, and the places that shape them. 
                    Some begin in polished boardrooms, others in humble village squares. But every story starts the same way - by listening with intention. 
                    V believes it takes trust, patience, and an eye for the unseen to capture what truly matters.
                    <br/>
                    V doesn't just tell stories - V honors them.
                </p>
            </div>
        </div>
    </section>
    );
};

const DoodleArrow = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 25 C 30 10, 70 40, 90 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M80 20 L 90 25 L 85 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const Polaroid = ({ img, title, listItems, rotation = 'rotate-2', delay = 0 }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

    return (
        <div ref={ref} className={`grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto py-20 fade-in-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}s` }}>
            <div className={`bg-white p-4 pb-16 shadow-xl relative transform ${rotation} hover:rotate-0 transition-all duration-500 ease-out group max-w-sm mx-auto md:mx-0 cursor-pointer`}>
                <div className="tape"></div>
                <div className="aspect-[4/5] overflow-hidden mb-4 bg-gray-100 relative">
                     <img src={img} alt={title} className="w-full h-full object-cover filter sepia-[.1] contrast-[.95] transition-all duration-500 group-hover:sepia-0 group-hover:scale-105" />
                </div>
                <h3 className="font-serif text-xl text-center text-navy absolute bottom-6 left-0 right-0">{title}</h3>
            </div>
            <div className="space-y-8 relative">
                 <div className="absolute -right-10 top-0 text-navy/20 opacity-50 hidden md:block animate-bounce-slow">
                     <Camera size={48} strokeWidth={1.5} />
                 </div>
    
                <h4 className="font-serif text-2xl md:text-3xl text-navy leading-relaxed">
                    {title === 'Film Production' && "Who says films are just an escape? We see them as a way to live many lives - to feel, to explore, and to tell stories that stay."}
                    {title === 'Branding' && "A brand isn't just what you see - it's what you remember, what you carry home, and what you trust."}
                </h4>
                <div className="text-navy/80 space-y-2 font-light">
                    <p className="font-medium mb-4">V {title === 'Film Production' ? 'crafts' : 'creates'}:</p>
                    <ul className="space-y-2 list-disc list-inside marker:text-orange">
                        {listItems.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                 <div className="pt-4 group cursor-pointer inline-block">
                    <p className="text-sm text-navy/60 mb-2 group-hover:text-orange transition-colors">Explore Now</p>
                    <DoodleArrow className="w-24 h-8 text-orange group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        </div>
    );
};

const Services = () => (
    <section id="services" className="py-32 px-6 relative overflow-hidden">
         <div className="text-center mb-24 max-w-3xl mx-auto relative">
             <div className="w-full h-4 bg-navy/10 absolute top-1/2 -translate-y-1/2 -z-10 transform -rotate-1"></div>
             <h2 className="font-serif text-3xl md:text-4xl text-navy bg-[#FFF8F3] inline-block px-6 relative z-10">
                 "Filmmaking is a chance to live many lifetimes." – Robert Altman
             </h2>
         </div>

        <Polaroid 
            title="Film Production" 
            img="https://placehold.co/600x750/2a2a2a/FFF?text=On+Set"
            rotation="-rotate-2"
            listItems={['Documentaries', 'Corporate Videos', '2D Animation Videos', '3D Animation Videos']}
        />
        <Polaroid 
            title="Branding" 
            img="https://placehold.co/600x750/f0e6e0/1B3B5A?text=Design"
            rotation="rotate-1"
            listItems={['Branding & Communication', 'Market Mapping', 'Content Management', 'Social Media Management', 'Rebranding']}
            delay={0.2}
        />
    </section>
);

const HighlightReel = () => {
    const parallaxOffset = useParallax(-0.1); // Move opposite direction for depth

    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                <h2 className="font-serif text-4xl text-navy mb-2">The Highlight Reel</h2>
                <p className="text-navy/60 font-light">Watch the magic we've captured.</p>
            </div>
    
            <div className="max-w-5xl mx-auto relative px-12">
                <div className="h-8 w-full bg-gradient-to-b from-gray-300 to-gray-100 flex justify-between px-2 py-1 mb-2">
                     {[...Array(15)].map((_, i) => <div key={`t-${i}`} className="h-full w-5 bg-white rounded-sm mx-1"></div>)}
                </div>
                
                <div className="bg-black p-2 relative aspect-video overflow-hidden shadow-2xl group cursor-pointer">
                     <img src="https://placehold.co/1920x1080/333/FFF?text=Video+Thumbnail" alt="Reel" className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"/>
                     <button className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
                            <Play fill="white" className="text-white w-12 h-12 ml-2" />
                        </div>
                    </button>
                </div>
    
                <div className="h-8 w-full bg-gradient-to-t from-gray-300 to-gray-100 flex justify-between px-2 py-1 mt-2">
                     {[...Array(15)].map((_, i) => <div key={`b-${i}`} className="h-full w-5 bg-white rounded-sm mx-1"></div>)}
                </div>
            </div>
             <Mandala className="w-[600px] h-[600px] -right-[300px] bottom-0 opacity-10" style={{ transform: `translateY(${parallaxOffset}px)` }} />
        </section>
    );
}

const StickyNote = ({ number, label, color = 'bg-[#FFF9C4]', rotation = 'rotate-2', delay = 0 }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });

    return (
        <div ref={ref} className={`${color} p-6 shadow-md transform ${rotation} hover:rotate-0 transition-all duration-500 w-48 h-48 md:w-56 md:h-56 flex flex-col items-center justify-center text-center relative paper-shadow fade-in-up ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}s` }}>
            <span className="font-serif text-5xl md:text-6xl text-navy mb-3">{number}</span>
            <span className="text-orange text-sm font-medium tracking-wider uppercase">{label}</span>
        </div>
    );
};

const Stats = () => (
    <section id="about" className="py-32 px-6 relative overflow-hidden">
         <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
             <div className="order-2 md:order-1 space-y-8 md:pr-12 relative">
                <div className="absolute -top-12 -left-12 w-24 h-24 border-2 border-orange/20 rounded-full opacity-50 animate-spin-slow md:block hidden"></div>
                <h2 className="font-serif text-3xl md:text-4xl text-navy leading-tight">
                    A montage of familiar faces and names.
                </h2>
                <p className="text-navy/70 font-light leading-relaxed text-sm md:text-base">
                    Some stories come from the biggest names. Others begin with bold, rising voices. 
                    We've been fortunate to walk alongside both - listening, creating, and building stories that matter.
                </p>
                <div className="flex gap-6 pt-8 transform -rotate-2">
                    <StickyNote number="85+" label="Projects" color="bg-[#FFF8E1]" rotation="-rotate-3" />
                    <StickyNote number="50+" label="Happy Clients" color="bg-[#FFF3E0]" rotation="rotate-6" delay={0.2} />
                    <div className="hidden lg:block"><StickyNote number="10+" label="Experts Team" color="bg-[#FBE9E7]" rotation="-rotate-1" delay={0.4} /></div>
                </div>
             </div>

             <div className="order-1 md:order-2 relative min-h-[400px] flex items-center justify-center">
                 <h3 className="font-serif italic text-3xl md:text-5xl text-navy/80 text-center leading-snug relative z-10">
                     Every project is more than just a brief - it's a new chapter waiting to be written.
                     <br/>
                     <span className="not-italic text-2xl md:text-4xl mt-4 block">Together, we've crafted tales that inspire, connect, and endure.</span>
                 </h3>
                 {/* Floating brand names in background with parallax */}
                 <div className="absolute inset-0 pointer-events-none opacity-15 font-bold text-orange select-none font-serif">
                     <span className="absolute top-0 left-10 rotate-12 text-4xl">TED</span>
                     <span className="absolute bottom-10 right-20 -rotate-12 text-3xl">CocaCola</span>
                     <span className="absolute top-1/4 right-0 rotate-45 text-2xl">ARTON</span>
                      <span className="absolute bottom-1/3 left-0 -rotate-45 text-2xl">Design Pro</span>
                 </div>
             </div>
         </div>
    </section>
);

const OurStory = () => {
    return (
        <section id="our-story" className="py-32 px-6 relative overflow-hidden bg-[#FFF5EE]">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="relative order-2 md:order-1">
                     <Mandala className="w-[500px] h-[500px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
                     <div className="relative z-10 flex justify-center items-end h-[400px]">
                         {/* Placeholder for the illustrated team - using icons to represent them */}
                         <div className="flex items-end space-x-6 opacity-80">
                             <User size={120} strokeWidth={1.5} className="text-navy" />
                             <User size={140} strokeWidth={1.5} className="text-navy" />
                             <User size={130} strokeWidth={1.5} className="text-navy" />
                             <User size={150} strokeWidth={1.5} className="text-navy" />
                         </div>
                         {/* Doodle labels */}
                         <div className="absolute top-10 left-1/4 font-hand text-2xl text-navy rotate-12">
                             Film Makers
                             <svg className="absolute top-full left-1/2 w-12 h-12 text-navy/70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                                 <path d="M10,10 Q50,50 50,90" />
                                 <path d="M40,80 L50,90 L60,80" />
                             </svg>
                         </div>
                          <div className="absolute bottom-20 left-0 font-hand text-2xl text-navy -rotate-12">
                             Branding Experts
                             <svg className="absolute bottom-full right-0 w-16 h-16 text-navy/70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M90,10 Q50,50 10,90" />
                                  <path d="M20,80 L10,90 L20,100" />
                             </svg>
                         </div>
                          <div className="absolute top-20 right-0 font-hand text-2xl text-navy rotate-6">
                             Art Curators
                             <svg className="absolute top-full right-full w-14 h-14 text-navy/70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                                 <path d="M90,10 Q50,50 10,90" />
                                 <path d="M20,80 L10,90 L20,100" />
                             </svg>
                         </div>

                     </div>
                </div>
                <div className="order-1 md:order-2 space-y-8 relative">
                     {/* Yellow sticky note */}
                    <div className="bg-[#FFF9C4] p-8 shadow-md rotate-2 max-w-md mx-auto md:mx-0 relative paper-shadow">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-navy/30 rounded-full rotate-12"></div>
                         <p className="font-serif text-lg text-navy/90 leading-relaxed">
                            Some craft films. Some build brands. Some curate art. We bring it all together - a collective of storytellers driven by one belief: every project deserves to be more than just a message; it should become a masterpiece.
                            <br/><br/>
                            From first spark to final frame, from raw ideas to timeless visuals - we shape stories that stay with you.
                        </p>
                    </div>
                     <div className="text-center md:text-left pt-8">
                        <h3 className="font-serif text-3xl text-navy mb-6">Take a closer look at the stories V bring to life.</h3>
                        <MagneticButton className="bg-orange text-white px-8 py-3 rounded-full font-medium hover:bg-navy transition-all shadow-md hover:shadow-lg inline-block">
                            View Portfolio
                        </MagneticButton>
                    </div>
                </div>
            </div>
        </section>
    )
}

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const [apiFeedback, setApiFeedback] = useState('');

    const validate = () => {
        let tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Name is required";
        if (!formData.email.trim()) { tempErrors.email = "Email is required"; } 
        else if (!/\S+@\S+\.\S+/.test(formData.email)) { tempErrors.email = "Email is invalid"; }
        if (!formData.phone.trim()) tempErrors.phone = "Phone is required";
        if (!formData.message.trim()) tempErrors.message = "Message is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('loading');
        setApiFeedback('');
        try {
            const response = await fetch('https://vernanbackend.ezlab.in/api/contact-us/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.status === 200) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Submission failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error("API submission error:", error);
            setStatus('error');
            setApiFeedback(error.message || 'Something went wrong. Please try again later.');
        }
    };

    return (
        <section id="contact" className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center mb-16">
                 <h2 className="font-serif text-5xl md:text-6xl text-navy mb-4">Join the Story</h2>
                 <p className="text-navy/70 text-xl">Ready to bring your vision to life? Let's talk.</p>
            </div>

            <div className="max-w-3xl mx-auto relative p-1 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))', boxShadow: '0 0 20px 5px rgba(150, 100, 255, 0.1), inset 0 0 20px 5px rgba(255, 255, 255, 0.5)' }}>
                <div className="bg-gray-200/50 backdrop-blur-md p-12 md:p-16 rounded-3xl border border-white/50 shadow-inner relative overflow-hidden">
                     {/* Glowing border effect */}
                     <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: 'inset 0 0 15px rgba(255,255,255,0.8), 0 0 15px rgba(200, 180, 255, 0.3)' }}></div>

                    {status === 'success' ? (
                         <div className="text-center py-12 space-y-4 animate-fade-in">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                            <h3 className="font-serif text-3xl text-navy">Message Sent!</h3>
                            <p className="text-navy/70">We'll be in touch shortly.</p>
                            <button onClick={() => setStatus('idle')} className="text-navy hover:underline mt-4 text-sm cursor-pointer font-medium">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            {status === 'error' && (
                                <div className="bg-red-50/80 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2 backdrop-blur-sm">
                                    <AlertCircle size={20} /> {apiFeedback}
                                </div>
                            )}
                            <div className="space-y-8">
                                <div className="relative">
                                    <input type="text" name="name" placeholder="Your name*" value={formData.name} onChange={handleChange}
                                        className={`w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-navy/20'} py-3 text-base text-navy placeholder:text-navy/50 focus:border-navy outline-none transition-all`} />
                                     {errors.name && <p className="text-red-500 text-xs mt-1 absolute">{errors.name}</p>}
                                </div>
                                <div className="relative">
                                    <input type="email" name="email" placeholder="Your email*" value={formData.email} onChange={handleChange}
                                        className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-navy/20'} py-3 text-base text-navy placeholder:text-navy/50 focus:border-navy outline-none transition-all`} />
                                     {errors.email && <p className="text-red-500 text-xs mt-1 absolute">{errors.email}</p>}
                                </div>
                                <div className="relative">
                                    <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange}
                                        className={`w-full bg-transparent border-b ${errors.phone ? 'border-red-500' : 'border-navy/20'} py-3 text-base text-navy placeholder:text-navy/50 focus:border-navy outline-none transition-all`} />
                                     {errors.phone && <p className="text-red-500 text-xs mt-1 absolute">{errors.phone}</p>}
                                </div>
                                <div className="relative">
                                    <textarea name="message" placeholder="Your message*" rows={4} value={formData.message} onChange={handleChange}
                                        className={`w-full bg-transparent border-b ${errors.message ? 'border-red-500' : 'border-navy/20'} py-3 text-base text-navy placeholder:text-navy/50 focus:border-navy outline-none transition-all resize-none`}></textarea>
                                     {errors.message && <p className="text-red-500 text-xs mt-1 absolute">{errors.message}</p>}
                                </div>
                            </div>
                            <div className="text-center pt-8">
                                <MagneticButton 
                                    type="submit" 
                                    disabled={status === 'loading'} 
                                    className="bg-orange text-white px-16 py-4 rounded-full font-bold tracking-wider text-sm hover:bg-navy transition-all shadow-lg hover:shadow-xl disabled:opacity-70 inline-flex items-center gap-3 relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {status === 'loading' && <Loader2 className="animate-spin" size={18} />}
                                        {status === 'loading' ? 'Sending...' : 'Submit'}
                                    </span>
                                    <div className="absolute inset-0 h-full w-0 bg-navy transition-all duration-300 group-hover:w-full"></div>
                                </MagneticButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <div className="text-center mt-16 space-y-6">
                 <p className="text-navy/70 max-w-2xl mx-auto">
                     Whether you have an idea, a question, or simply want to explore how V can work together, we're just a message away.
                 </p>
                 <div className="flex flex-wrap justify-center gap-8 text-orange text-sm font-bold tracking-widest uppercase">
                     <a href="mailto:vernita@varnanfilms.co.in" className="hover:text-navy transition-colors cursor-pointer">vernita@varnanfilms.co.in</a>
                     <span className="text-navy/20">|</span>
                     <a href="tel:+919873684567" className="hover:text-navy transition-colors cursor-pointer">+91 98736 84567</a>
                 </div>
             </div>
        </section>
    );
};

const Footer = () => (
    <footer className="py-8 px-6 border-t border-navy/5 text-center text-navy/40 text-sm flex justify-between max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} V Films. All rights reserved.</p>
        <div className="flex items-center gap-4">
             <a href="#" className="hover:text-orange cursor-pointer transition-colors transform hover:-translate-y-1"><Instagram size={18} /></a>
             <a href="#" className="hover:text-orange cursor-pointer transition-colors transform hover:-translate-y-1"><Linkedin size={18} /></a>
             <a href="#" className="hover:text-orange cursor-pointer transition-colors transform hover:-translate-y-1"><Twitter size={18} /></a>
        </div>
    </footer>
);

// Scroll to Top Button Component
const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        isVisible && (
            <button
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 bg-orange text-white p-3 rounded-full shadow-lg hover:bg-navy transition-all duration-300 z-50 group"
                aria-label="Scroll to top"
            >
                <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
            </button>
        )
    );
};

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <GlobalStyles />
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <ScrollToTop />
      <div className="bg-texture"></div>
      <Navigation />
      <main>
        <Hero />
        <Services />
        <OurStory />
        <HighlightReel />
        <Stats />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}