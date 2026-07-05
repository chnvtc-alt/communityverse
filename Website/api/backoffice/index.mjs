import { requireQuestionsAdmin } from "../_lib/admin-auth.mjs";
import {
  deleteBackofficeCollection,
  deleteBackofficeExpense,
  deleteBackofficeRestaurant,
  fetchBackofficeData,
  importBackofficeBackup,
  saveBackofficeCollection,
  saveBackofficeExpense,
  saveBackofficeRestaurant,
} from "../_lib/backoffice-admin.mjs";
import { sendBackofficeInvoiceEmail } from "../_lib/backoffice-invoices.mjs";
import { hasSupabaseConfig, jsonResponse, readJsonBody } from "../_lib/supabase.mjs";

function preflight(request) {
  const denied = requireQuestionsAdmin(request);
  if (denied) return denied;
  if (!hasSupabaseConfig()) {
    return jsonResponse({ ok: false, error: "Supabase is not configured." }, 503);
  }
  return null;
}

export async function GET(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    return jsonResponse({ ok: true, ...(await fetchBackofficeData()) });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export async function POST(request) {
  const blocked = preflight(request);
  if (blocked) return blocked;

  try {
    const body = await readJsonBody(request);
    const action = String(body?.action || "").trim();

    if (action === "saveRestaurant") {
      return jsonResponse({ ok: true, restaurant: await saveBackofficeRestaurant(body.restaurant) });
    }

    if (action === "deleteRestaurant") {
      await deleteBackofficeRestaurant(body.id);
      return jsonResponse({ ok: true });
    }

    if (action === "saveCollection") {
      return jsonResponse({ ok: true, collection: await saveBackofficeCollection(body.collection) });
    }

    if (action === "deleteCollection") {
      await deleteBackofficeCollection(body.id);
      return jsonResponse({ ok: true });
    }

    if (action === "sendInvoice") {
      const backofficeData = await fetchBackofficeData();
      const collection = backofficeData.collections.find((record) => record.id === String(body.id || "").trim());
      if (!collection) {
        return jsonResponse({ ok: false, error: "Invoice was not found." }, 404);
      }
      const restaurant = backofficeData.restaurants.find((record) => record.id === collection.restaurantId);
      const result = await sendBackofficeInvoiceEmail({
        collection,
        restaurant,
        test: body.test === true,
      });
      return jsonResponse({ ok: true, ...result });
    }

    if (action === "saveExpense") {
      return jsonResponse({ ok: true, expense: await saveBackofficeExpense(body.expense) });
    }

    if (action === "deleteExpense") {
      await deleteBackofficeExpense(body.id);
      return jsonResponse({ ok: true });
    }

    if (action === "importBackup") {
      return jsonResponse({ ok: true, ...(await importBackofficeBackup(body.backup)) });
    }

    return jsonResponse({ ok: false, error: "Unknown Back Office action." }, 400);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
