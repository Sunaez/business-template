import { getBrandConfig, getProducts } from "@/lib/catalog";
import { buildMerchantFeed } from "@/lib/merchant-feed";
import { getSiteOrigin, isSiteIndexable } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (
    !preview &&
    (process.env.GOOGLE_MERCHANT_ENABLED !== "true" || !isSiteIndexable())
  ) {
    return Response.json(
      {
        error:
          "Live feed is not enabled. Preview at /feeds/google.xml?preview=1. See docs/google-merchant.md for setup.",
      },
      { status: 503, headers },
    );
  }
  try {
    const origin = getSiteOrigin();
    if (
      !preview &&
      (!origin.startsWith("https://") ||
        /localhost|\.example$|\.test$|\.local$|\[|\/\d+(\.\d+){3}$/.test(
          origin,
        ))
    ) {
      return Response.json(
        {
          error:
            "Configure a public HTTPS domain before enabling the live feed.",
        },
        { status: 503, headers },
      );
    }
    const brand = await getBrandConfig();
    const products = await getProducts({ businessId: brand.businessId });
    return new Response(
      buildMerchantFeed({ brand, products, origin, preview }),
      {
        headers: {
          ...headers,
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": `inline; filename="google-products${preview ? "-preview" : ""}.xml"`,
        },
      },
    );
  } catch (error) {
    console.error("Merchant feed generation failed", error);
    return Response.json(
      {
        error:
          "Product feed could not be generated. Check the server configuration and catalogue data.",
      },
      { status: 500, headers },
    );
  }
}
