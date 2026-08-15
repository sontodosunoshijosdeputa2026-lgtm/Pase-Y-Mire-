const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function response(status, body) {
  return {
    status,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

async function supabase(path, options = {}) {
  const result = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await result.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!result.ok) {
    throw new Error(
      data?.msg ||
      data?.message ||
      data?.error_description ||
      "Error de Supabase"
    );
  }

  return data;
}

async function getAdminProfile(userId) {
  const rows = await supabase(
    `/rest/v1/admin_profiles?user_id=eq.${encodeURIComponent(userId)}&select=user_id,admin_level,is_active`
  );

  return rows?.[0] || null;
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  try {

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: "Servidor no configurado"
      });
    }

    const authHeader =
      req.headers.authorization || "";

    const token =
      authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({
        error: "Sesión requerida"
      });
    }

    const requester = await supabase(
      "/auth/v1/user",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const admin =
      await getAdminProfile(requester.id);

    if (
      !admin ||
      !admin.is_active ||
      !["super_admin", "admin"].includes(
        admin.admin_level
      )
    ) {
      return res.status(403).json({
        error: "No autorizado"
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

    if (password.length < 8) {
      return res.status(400).json({
        error:
          "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const user =
      await supabase(
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

    return res.status(201).json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "No se pudo crear el usuario"
    });

  }
                                }
