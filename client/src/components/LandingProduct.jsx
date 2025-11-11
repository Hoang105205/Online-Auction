import SideBar from "../components/SideBar";
import HomeContent from "../components/HomeContent";

const LandingProduct = () => {
  return (
    <div className="flex min-h-screen">
        <aside className="w-[500px] bg-white border-r p-4">
            <SideBar />
        </aside>
        <main className="flex-1 p-6 overflow-y-auto">
            <HomeContent />
        </main>
    </div>
  );
};

export default LandingProduct;
