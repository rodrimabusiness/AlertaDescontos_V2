"use client";

import { scrapeAndStoreProduct } from "@/lib/actions";
import { signIn, useSession } from "next-auth/react";
import { FormEvent, useState } from "react";

const isValidProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    // Verifica se a URL é da Amazon ou da Worten
    return (
      hostname.includes("amazon.es") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon") ||
      hostname.includes("worten.pt") ||
      hostname.includes("worten")
    );
  } catch (error) {
    return false; // Retorna falso se a URL não puder ser analisada corretamente
  }
};

const Searchbar = () => {
  //  const { data: session } = useSession();
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /* nao precisa de log in
    if (!session) {
      // Redireciona para a página de login, você pode também especificar uma URL de retorno após o login
      signIn("credentials", { callbackUrl: "/after-login-page" });
      return;
    }
    */
    const isValidLink = isValidProductURL(searchPrompt);

    if (!isValidLink) {
      alert("Por favor forneça um link da Amazon ou Worten");
      return;
    }

    try {
      setIsLoading(true);
      // Tenta raspar e armazenar os dados do produto
      const product = await scrapeAndStoreProduct(searchPrompt);
      console.log("Product scraped and stored:", product);
    } catch (error) {
      console.error("Error scraping the product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Introduza um link da Amazon.es ou Worten"
        className="searchbar-input"
      />

      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ""}
      >
        {isLoading ? "A Procurar..." : "Procura"}
      </button>
    </form>
  );
};

export default Searchbar;
