import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageLoader from "@/components/ui/PageLoader";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative bg-brand-paper pb-28 pt-40">
          <div className="mx-auto max-w-6xl px-6">
            <PageLoader />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
