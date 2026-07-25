import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { getSettings } from "@/services/settings.service";

/** Chrome de la tienda. El panel /admin usa su propio layout. */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const announcement = settings.announcementActive
    ? settings.announcement
    : undefined;

  return (
    <>
      <Navbar announcement={announcement} />
      {/* El padding compensa el header fijo, con o sin barra de aviso. */}
      <main className={announcement ? "pt-[6.75rem]" : "pt-18"}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
