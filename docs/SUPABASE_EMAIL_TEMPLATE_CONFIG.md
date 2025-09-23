# 📧 Supabase Email Template Configuration

## Overview
Configure Supabase email templates to properly redirect users back to their original share page after authentication.

## Steps to Configure

### 1. Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### 2. Update the "Confirm Signup" Template

Replace the default template with:

```html
<h2>Confirma tu registro en Decollage.cl</h2>
<p>Hola,</p>
<p>Gracias por unirte a Decollage.cl. Sigue este enlace para confirmar tu cuenta y volver a donde estabas:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<hr />
<p style="font-size: 12px; color: #666;">
  Este enlace expira en 1 hora. Si no solicitaste este email, puedes ignorarlo.
</p>
```

### 3. Update the "Magic Link" Template

For the Magic Link email template:

```html
<h2>Tu enlace mágico para Decollage.cl</h2>
<p>Hola,</p>
<p>Haz clic en el siguiente enlace para acceder a tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}" style="
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(to right, #A3B1A1, #C4886F);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-family: sans-serif;
">Acceder a mi cuenta</a></p>
<p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<hr />
<p style="font-size: 12px; color: #666;">
  Este enlace expira en 1 hora y solo puede ser usado una vez.
  <br>
  Si no solicitaste este email, puedes ignorarlo.
</p>
```

### 4. Update Redirect URLs in Supabase

1. Go to **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   https://decollage.cl/auth/confirm
   http://localhost:3000/auth/confirm
   http://localhost:3001/auth/confirm
   http://localhost:3002/auth/confirm
   ```

### 5. Configure Email Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Ensure these settings:
   - ✅ Enable Email Provider
   - ✅ Confirm email = ON
   - ✅ Secure email change = ON
   - ✅ Secure password change = ON

### 6. Update Auth Settings

1. Go to **Authentication** → **Auth Settings**
2. Set:
   - **Site URL**: `https://decollage.cl`
   - **Redirect URLs**: Include all the URLs from step 4
   - **External URLs**: Leave empty unless using OAuth

## Testing the Configuration

### Test Flow:
1. Go to a share page: `/share/[token]`
2. Click on "Like" or any interaction
3. Enter email in the modal
4. Check email - the link should include the redirect parameter
5. Click the link
6. Should be redirected back to the original share page

### Expected URL Format in Email:
```
https://dlbkggvlkswiougxxhgi.supabase.co/auth/v1/verify
  ?token=pkce_xxx
  &type=signup
  &redirect_to=https://decollage.cl/auth/confirm?redirect=/share/[token]
```

## Troubleshooting

### Issue: Redirect goes to homepage instead of share page
**Solution**: Ensure the `emailRedirectTo` parameter includes the full redirect path

### Issue: PKCE token instead of magic link
**Solution**: This is normal for Supabase. Our auth confirmation page handles both PKCE and magic link flows.

### Issue: Email not arriving
**Solution**:
1. Check Supabase email logs in **Authentication** → **Logs**
2. Check spam folder
3. Verify email provider settings

## Environment Variables

Ensure these are set in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://dlbkggvlkswiougxxhgi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Notes
- Supabase uses PKCE flow by default for security
- The redirect parameter must be URL encoded
- Email templates support basic HTML and Handlebars variables
- Always test in both development and production environments