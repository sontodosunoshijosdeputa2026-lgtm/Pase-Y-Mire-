const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function db(path, options = {}) {

  const r = await fetch(`${URL}${path}`, {
    ...options,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await r.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!r.ok) {
    throw new Error(
      data?.message ||
      data?.msg ||
      "Error de Supabase"
    );
  }

  return data;
}

async function currentAdmin(token) {

  const user =
    await db(
      "/auth/v1/user",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const rows =
    await db(
      `/rest/v1/admin_profiles?user_id=eq.${encodeURIComponent(user.id)}&select=user_id,admin_level,is_active`
    );

  return {
    user,
    profile: rows?.[0] || null
  };
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    const token =
      (req.headers.authorization || "")
        .replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        error: "Sesión requerida"
      });
    }

    const {
      user,
      profile
    } = await currentAdmin(token);

    if (
      !profile ||
      !profile.is_active
    ) {
      return res.status(403).json({
        error: "Administrador no autorizado"
      });
    }

    const {
      action,
      target_user_id,
      amount,
      note
    } = req.body || {};

    const value =
      Number(amount);

    if (
      !target_user_id ||
      !Number.isInteger(value) ||
      value <= 0
    ) {
      return res.status(400).json({
        error:
          "Usuario y cantidad válida son obligatorios"
      });
    }

    if (action === "generate") {

      if (
        profile.admin_level !==
        "super_admin"
      ) {
        return res.status(403).json({
          error:
            "Solo el Super Admin puede crear créditos"
        });
      }

      const result =
        await db(
          "/rest/v1/rpc/generate_credits",
          {
            method: "POST",
            body: JSON.stringify({
              target_user_id,
              amount_to_add: value,
              note:
                note ||
                "Emisión de créditos"
            })
          }
        );

      return res.status(200).json({
        ok: true,
        action,
        result
      });
    }

    if (action === "transfer") {

      const result =
        await db(
          "/rest/v1/rpc/transfer_credits",
          {
            method: "POST",
            body: JSON.stringify({
              target_user_id,
              amount_to_transfer: value,
              note:
                note ||
                "Transferencia de créditos"
            })
          }
        );

      return res.status(200).json({
        ok: true,
        action,
        result
      });
    }

    return res.status(400).json({
      error:
        "Acción inválida"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "Error procesando créditos"
    });

  }
      }
