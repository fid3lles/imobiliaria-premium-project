import HomeSearch from "../components/Search/HomeSearch";
import Section from "../components/Section/Section";

function Home() {
  return (
    <>
      <Section
        bg="/assets/hero_main_section.jpg"
        className="min-h-160.5 flex items-center"
      >
        <HomeSearch
          onSearch={(payload) => console.log("buscar:", payload)}
          onSearchByCode={(codigo) => console.log("codigo:", codigo)}
        />
      </Section>
    </>
  );
}
export default Home;
