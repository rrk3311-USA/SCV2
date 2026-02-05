import { CONTACT } from "@/lib/constants";
import Link from "next/link";
import { MapPin, Envelope, Phone } from "@phosphor-icons/react/dist/ssr";

const cards = [
  {
    title: "Address",
    content: (
      <>
        {CONTACT.address}
        <br />
        {CONTACT.cityStateZip}
      </>
    ),
    href: null,
    Icon: MapPin,
  },
  {
    title: "Email",
    content: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    Icon: Envelope,
  },
  {
    title: "Phone",
    content: CONTACT.phone,
    href: `tel:${CONTACT.phoneRaw}`,
    Icon: Phone,
  },
];

export function ContactInfoCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.Icon;
        return (
        <div
          key={card.title}
          className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 flex justify-center text-[#2854a6]" aria-hidden>
            <Icon size={28} weight="regular" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
          {card.href ? (
            <p className="mt-2 text-sm text-gray-600">
              <Link
                href={card.href}
                className="text-[#2854a6] font-medium hover:underline"
              >
                {card.content}
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
              {card.content}
            </p>
          )}
        </div>
      );
      })}
    </div>
  );
}
