import Navbar from "./components/navbar";
import Hero from "./sections/hero/hero";
import About from "./sections/about/about";
import Skills from "./sections/skills/skills";
import Projects from "./sections/projects/projects";
import Certificates from "./sections/certificates/certificates";
import Contacts from "./sections/contacts/contacts";
import Background3D from "./sections/hero/background3d";
import FloatingAvatar from "./components/FloatingAvatar";

export default function App() {
  return (
    <>
      <Background3D />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Contacts />
      </main>
      <FloatingAvatar />
    </>
  );
}