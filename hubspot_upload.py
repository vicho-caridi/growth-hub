#!/usr/bin/env python3
"""
hubspot_upload.py
=================
Toma el JSON exportado desde el SDR Sequence Builder y crea los
email templates en HubSpot listos para armar la secuencia manualmente.

Uso:
    python hubspot_upload.py --token TU_TOKEN --json secuencia.json --nombre "Secuencia SaaS CTOs"

Requisitos:
    pip install requests

Obtener token:
    HubSpot → Settings → Integrations → Private Apps → Create app
    Permisos necesarios: crm.objects.contacts.read, content (para templates)
"""

import argparse
import json
import sys
import requests


HUBSPOT_BASE = "https://api.hubapi.com"


def get_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def create_email_template(token: str, nombre_secuencia: str, paso: int, delay: int, asunto: str, cuerpo: str) -> dict:
    """
    Crea un template de email en HubSpot (Sales Templates).
    Endpoint: POST /sales-email/v1/templates
    """
    url = f"{HUBSPOT_BASE}/sales-email/v1/templates"

    # Convertir cuerpo plano a HTML básico manteniendo saltos de línea
    cuerpo_html = "<br>".join(
        f"<p>{line}</p>" if line.strip() else "<br>"
        for line in cuerpo.split("\n")
    )

    payload = {
        "name": f"[{nombre_secuencia}] Email {paso} (+{delay}d)",
        "subject": asunto,
        "body": cuerpo_html,
        "type": "SALES_EMAIL",
        "isTeamTemplate": False,
    }

    resp = requests.post(url, headers=get_headers(token), json=payload)

    if resp.status_code in (200, 201):
        data = resp.json()
        return {"ok": True, "id": data.get("id"), "name": payload["name"]}
    else:
        return {
            "ok": False,
            "status": resp.status_code,
            "error": resp.text,
            "name": payload["name"],
        }


def load_sequence_json(path: str) -> list:
    """Carga el JSON generado por la app web."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Soporta tanto {"secuencia": [...]} como directamente [...]
    if isinstance(data, dict) and "secuencia" in data:
        return data["secuencia"]
    elif isinstance(data, list):
        return data
    else:
        raise ValueError("Formato de JSON no reconocido. Esperaba {'secuencia': [...]} o [...]")


def print_summary(results: list, nombre_secuencia: str):
    """Imprime un resumen del resultado."""
    print("\n" + "=" * 60)
    print(f"  RESUMEN: {nombre_secuencia}")
    print("=" * 60)

    ok = [r for r in results if r["ok"]]
    fail = [r for r in results if not r["ok"]]

    print(f"\n✅ Templates creados exitosamente: {len(ok)}/{len(results)}")
    for r in ok:
        print(f"   └─ {r['name']} (ID: {r['id']})")

    if fail:
        print(f"\n❌ Fallos: {len(fail)}")
        for r in fail:
            print(f"   └─ {r['name']}")
            print(f"      Status: {r['status']}")
            print(f"      Error: {r['error'][:200]}")

    print("\n" + "=" * 60)
    print("PRÓXIMOS PASOS EN HUBSPOT:")
    print("=" * 60)
    print("""
1. Ve a HubSpot → Sales → Sequences → New Sequence
2. Dale el nombre de tu secuencia
3. Para cada paso:
   a. Haz clic en "Add step" → "Automated email"
   b. En "Template", busca "[{nombre}] Email N"
   c. Ajusta el delay (días) según la columna +Xd
4. Guarda y activa la secuencia
5. ¡Listo! Enrola tus contactos

DELAYS RECOMENDADOS:
""".format(nombre=nombre_secuencia))


def main():
    parser = argparse.ArgumentParser(
        description="Sube una secuencia de emails a HubSpot como templates."
    )
    parser.add_argument(
        "--token", required=True,
        help="HubSpot Private App Token (empieza con pat-...)"
    )
    parser.add_argument(
        "--json", required=True, dest="json_path",
        help="Ruta al archivo JSON exportado desde el SDR Sequence Builder"
    )
    parser.add_argument(
        "--nombre", required=True,
        help="Nombre de la secuencia (ej: 'Prospección SaaS CTOs Q1')"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Muestra lo que se haría sin hacer llamadas a HubSpot"
    )

    args = parser.parse_args()

    # Cargar secuencia
    print(f"\n📂 Cargando secuencia desde: {args.json_path}")
    try:
        emails = load_sequence_json(args.json_path)
    except FileNotFoundError:
        print(f"❌ Archivo no encontrado: {args.json_path}")
        sys.exit(1)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"❌ Error en el JSON: {e}")
        sys.exit(1)

    print(f"✅ {len(emails)} emails cargados")
    print(f"📝 Secuencia: {args.nombre}\n")

    if args.dry_run:
        print("🔍 DRY RUN - No se harán cambios en HubSpot\n")
        for email in emails:
            print(f"  Email {email['paso']} (+{email['delay']}d) → {email['asunto']}")
        print("\nEjecuta sin --dry-run para subir a HubSpot.")
        return

    # Subir templates
    results = []
    for email in emails:
        print(f"📤 Subiendo Email {email['paso']}: {email['asunto'][:50]}...")
        result = create_email_template(
            token=args.token,
            nombre_secuencia=args.nombre,
            paso=email["paso"],
            delay=email["delay"],
            asunto=email["asunto"],
            cuerpo=email["cuerpo"],
        )
        results.append(result)
        status = "✅" if result["ok"] else "❌"
        print(f"  {status} {'ID: ' + str(result.get('id', '')) if result['ok'] else result.get('error', '')[:80]}")

    print_summary(results, args.nombre)

    # Exportar IDs para referencia
    ids_file = "hubspot_template_ids.json"
    with open(ids_file, "w") as f:
        json.dump({
            "secuencia": args.nombre,
            "templates": [
                {
                    "paso": emails[i]["paso"],
                    "delay_dias": emails[i]["delay"],
                    "asunto": emails[i]["asunto"],
                    "hubspot_id": r.get("id"),
                    "hubspot_nombre": r.get("name"),
                }
                for i, r in enumerate(results) if r["ok"]
            ]
        }, f, indent=2, ensure_ascii=False)

    print(f"\n💾 IDs guardados en: {ids_file}")
    print("   Úsalos para referencia al armar la secuencia en HubSpot.\n")


if __name__ == "__main__":
    main()
