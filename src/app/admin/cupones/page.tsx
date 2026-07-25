import { Trash2 } from "lucide-react";
import {
  AdminPage,
  EmptyState,
  Panel,
  Td,
  Th,
} from "@/features/admin/components/AdminUI";
import { Badge } from "@/components/ui/Badge";
import { CouponForm } from "@/features/admin/components/CouponForm";
import {
  deleteCouponAction,
  toggleCouponAction,
} from "@/features/admin/actions";
import { getCoupons } from "@/services/coupons.service";
import { BUSINESS } from "@/lib/config";
import { formatDate } from "@/utils";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  const now = Date.now();

  return (
    <AdminPage
      title="Cupones"
      description={`Un cupón por pedido, no acumulables. Descuento máximo ${BUSINESS.maxCouponDiscount}%.`}
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel title="Nuevo cupón">
          <div className="p-5">
            <CouponForm />
          </div>
        </Panel>

        <Panel title={`${coupons.length} cupones`}>
          {coupons.length === 0 ? (
            <EmptyState message="No hay cupones creados." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-2xl">
                <thead className="border-b border-white/8">
                  <tr>
                    <Th>Código</Th>
                    <Th>Descuento</Th>
                    <Th>Vigencia</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {coupons.map((coupon) => {
                    const expired = new Date(coupon.expiration).getTime() < now;

                    return (
                      <tr key={coupon.id}>
                        <Td className="font-medium tracking-widest text-white">
                          {coupon.code}
                        </Td>
                        <Td className="tabular text-aura">
                          {coupon.discount}%
                        </Td>
                        <Td className="text-xs text-mist">
                          {formatDate(coupon.starts_at)} →{" "}
                          {formatDate(coupon.expiration)}
                        </Td>
                        <Td>
                          {expired ? (
                            <Badge tone="muted">Expirado</Badge>
                          ) : coupon.active ? (
                            <Badge tone="success">Activo</Badge>
                          ) : (
                            <Badge tone="danger">Inactivo</Badge>
                          )}
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <form action={toggleCouponAction}>
                              <input
                                type="hidden"
                                name="id"
                                value={coupon.id}
                              />
                              <button
                                type="submit"
                                className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-mist transition-colors hover:border-aura hover:text-aura"
                              >
                                {coupon.active ? "Desactivar" : "Activar"}
                              </button>
                            </form>

                            <form action={deleteCouponAction}>
                              <input
                                type="hidden"
                                name="id"
                                value={coupon.id}
                              />
                              <button
                                type="submit"
                                aria-label={`Eliminar cupón ${coupon.code}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-mist transition-colors hover:bg-danger/10 hover:text-danger"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
