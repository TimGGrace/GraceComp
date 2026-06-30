import { Link } from "@tanstack/react-router";


export default function Header() {
  const links = [{ to: "/", label: "Home" },
    {to: "https://food.tgrace.dev", label: "Food"},
    {to: "https://www.tgrace.dev", label: "Sims"},
  ] as const;
  
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            if (to[0]=="/") return (
              <Link key={to} to={to as any}>
                {label}
              </Link>
            )
            if (to[0]=="h") return (
              <a key={to} href={to}>
                {label}
              </a>
            )
          })}
        </nav>
        <div className="flex items-center gap-2"></div>
      </div>
      <hr />
    </div>
  );
}
