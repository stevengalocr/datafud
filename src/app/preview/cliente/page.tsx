import { PreviewBanner } from "@/components/preview/preview-banner";
import { MenuClient } from "@/app/m/[tenant]/[table]/menu-client";
import { mockMenuPayload } from "@/lib/demo/mock";

export default function PreviewCliente() {
  return (
    <div>
      <PreviewBanner active="/preview/cliente" />
      <MenuClient data={mockMenuPayload} slug="demo" token="demo-token" demo />
    </div>
  );
}
