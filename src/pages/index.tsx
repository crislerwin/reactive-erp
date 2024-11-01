import HeroCarousel from "@/components/ui/HeroCarousel";
import { Grid } from "@mantine/core";

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <Grid className="mt-2 flex max-w-screen-2xl justify-center">
        <HeroCarousel />
      </Grid>
    </div>
  );
}
