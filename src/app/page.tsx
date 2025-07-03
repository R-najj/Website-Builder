import dynamic from "next/dynamic";
import BuilderSkeleton from "@/components/BuilderSkeleton";

const BuilderClient = dynamic(() => import("../components/BuilderClient"), {
  loading: () => <BuilderSkeleton />,
});

export default function Home() {
  return <BuilderClient />;
}
