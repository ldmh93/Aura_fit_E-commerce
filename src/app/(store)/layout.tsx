import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CartDrawer } from "@/features/cart/components/CartDrawer";

/** Chrome de la tienda. El panel /admin usa su propio layout. */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="pt-18">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
