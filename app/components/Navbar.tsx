import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { options } from "../api/auth/[...nextauth]/options";
import { User } from "@/lib/models/product.model";
//import UserForm from "./UserForm";

// Array de ícones a serem exibidos na Navbar, com ícones de pesquisa, coração e usuário comentados
const navIcons = [
  { src: "/assets/icons/search.svg", alt: "search" },
  // { src: "/assets/icons/black-heart.svg", alt: "heart" },
  // { src: "/assets/icons/user.svg", alt: "user" },
];

// Se o usuário não está logado, ele não pode ver as informações de perfil
const Navbar = async () => {
  //const session = await getServerSession(options);

  return (
    <header className="w-full">
      <nav className="nav">
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/assets/icons/logo.svg"
            width={27}
            height={27}
            alt="logo"
          />

          <p className="nav-logo">
            Alerta<span className="text-primary">Descontos</span>
          </p>
        </Link>

        <div className="flex items-center gap-5">
          {
            /* Renderização condicional dos ícones: se o array tiver ícones, eles são renderizados */
            //este bloco de codigo permite fazer comandos consoante se ha sessao
          }
          {navIcons.map((icon) => (
            <Image
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className="object-contain"
            />
          ))}

          {/*/<UserForm />*/}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
/*
{session ? (
  <Link href="/api/auth/signout?callbackUrl=/">Logout</Link>
) : (
  <Link href="/api/auth/signin">Login</Link> // Updated to point to the custom sign-in page
)}
*/
