const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

async function callSupabase(path, options = {}) {

  const response = await fetch(
    `${SUPABASE_URL}${path}`,
    {
      ...options,
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization:
          `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.msg ||
      data?.message ||
      data?.error_description ||
      "Error de Supabase"
    );
  }

  return data;
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

    const requester =
      await callSupabase(
        "/auth/v1/user",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const profiles =
      await callSupabase(
        `/rest/v1/admin_profiles?user_id=eq.${encodeURIComponent(requester.id)}&select=admin_level,is_active`
      );

    const profile = profiles?.[0];

    if (
      !profile ||
      !profile.is_active ||
      profile.admin_level !== "super_admin"
    ) {
      return res.status(403).json({
        error:
          "Solo el Super Admin puede crear Sub Admins"
      });
    }

    const {
      email,
      password,
      username
    } = req.body || {};

    if (!email || !password || !username) {
      return res.status(400).json({
        error:
          "Email, contraseña y usuario son obligatorios"
      });
    }

    const created =
      await callSupabase(
        "/auth/v1/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              username
            }
          })
        }
      );

    await callSupabase(
      "/rest/v1/rpc/create_subadmin",
      {
        method: "POST",
        body: JSON.stringify({
          p_user_id: created.id
        })
      }
    );

    return res.status(201).json({
      ok: true,
      user: {
        id: created.id,
        email: created.email,
        username
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "No se pudo crear el Sub Admin"
    });

  }
  }
