import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle: string;
  image?: string;
}

export function PageHero({ title, subtitle, image = "/images/court-4.jpg" }: PageHeroProps) {
  return (
    <section className="relative h-64 sm:h-80">
      <Image src={image} alt="" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-primary/80" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-16">
        <p className="text-accent text-xs sm:text-sm tracking-[0.3em] font-medium mb-2">
          {subtitle}
        </p>
        <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider">
          {title}
        </h1>
      </div>
    </section>
  );
}
