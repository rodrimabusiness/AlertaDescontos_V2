import HeroCarousel from "@/components/HeroCarousel";
import Searchbar from "@/components/Searchbar";
import Image from "next/image";
import { getAllProducts } from "@/lib/actions";
import ProductCard from "@/components/ProductCard";
import { getServerSession } from "next-auth/next";
import { options } from "./api/auth/[...nextauth]/options";

const Home = async () => {
  const allProducts = await getAllProducts();

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text">
              Compras inteligentes começam aqui
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="seta para a direita"
                width={16}
                height={16}
              />
            </p>

            <h1 className="head-text">
              Abuse do Poder de
              <span className="text-primary"> AlertaDescontos</span>
            </h1>

            <p className="mt-6">
              Análises poderosas e autónomas de produtos para ajudá-lo a poupar
              dinheiro, economizar tempo e conseguir mais por menos.
            </p>

            <Searchbar />
          </div>

          <HeroCarousel />
        </div>
      </section>

      <section className="trending-section ">
        <h2 className="section-text">Em Tendência</h2>

        <div className="flex flex-wrap gap-x-8 gap-y-16">
          {allProducts?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
