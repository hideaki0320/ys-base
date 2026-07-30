import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle: string;
  image?: string;
}

export function PageHero({ title, subtitle, image = "/images/hero_img.png" }: PageHeroProps) {
  return (
    <section className="relative h-56 sm:h-72 overflow-hidden">
      <Image src={image} alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/70 via-primary/50 to-primary-dark/80" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-16">
        <p className="text-accent/80 text-[10px] sm:text-xs tracking-[0.4em] font-medium mb-3 uppercase">
          {subtitle}
        </p>
        <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider">
          {title}
        </h1>
        <div className="w-10 h-[2px] bg-accent/60 mt-5" />
      </div>
    </section>
  );
}
