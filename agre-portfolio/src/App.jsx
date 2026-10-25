import Navbar from "./components/navbar";
import Hero from "./sections/hero/hero";
import About from "./sections/about/about";
import Skills from "./sections/skills/skills";
import Projects from "./sections/projects/projects";
import Certificates from "./sections/certificates/certificates";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        {/* Next: <Contact /> */}
      </main>
    </>
  );
}