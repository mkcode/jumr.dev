import clsx from "clsx";
import { type NextPage, InferGetStaticPropsType } from "next";
import Image, { StaticImageData } from "next/future/image";
import Head from "next/head";
import React from "react";
import { AiOutlineGithub, AiOutlineStar } from "react-icons/ai";
import { SiTypescript } from "react-icons/si";
import { z } from "zod";

import { NextLink } from "~/components/next-link";

import CT3APreview from "../../public/images/ct3a.png";
import CT3TPreview from "../../public/images/ct3t.png";
import PfvPreview from "../../public/images/pfv.png";
import StocksPreview from "../../public/images/stocks.png";
import SvPreview from "../../public/images/sv.png";
import TRPCPreview from "../../public/images/trpc.png";

type RepoStatus = "In Progress" | null;
const REPOS: Record<
  "personal" | "oss",
  {
    name: string;
    img: StaticImageData;
    status?: RepoStatus;
  }[]
> = {
  personal: [
    {
      name: "juliusmarminge/stocks",
      img: StocksPreview,
      status: "In Progress",
    },
    { name: "t3-oss/create-t3-turbo", img: CT3TPreview },
    {
      name: "juliusmarminge/pathfinding-visualizer",
      img: PfvPreview,
    },
    {
      name: "juliusmarminge/sorting-visualizer",
      img: SvPreview,
    },
  ],
  oss: [
    { name: "t3-oss/create-t3-app", img: CT3APreview },
    { name: "trpc/trpc", img: TRPCPreview },
  ],
};

const ProjectSection: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <div className="py-4">
      <h2 className="py-1 text-2xl font-bold">{title}</h2>
      <p className="text-md pb-4">{description}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>
    </div>
  );
};

const StatusCard: React.FC<{ status: RepoStatus }> = ({ status }) => {
  return (
    <div
      className={clsx(
        "h-max rounded-xl px-2 py-1 text-sm font-semibold text-zinc-900",
        { "bg-yellow-500": status === "In Progress" },
      )}
    >
      {status}
    </div>
  );
};

const LanguageIcon: React.FC<{ language: string }> = ({ language }) => {
  if (language.toLowerCase() === "typescript") {
    return <SiTypescript className="text-lg text-blue-500" />;
  }
  // TODO: Add more languages
  return null;
};

const ProjectCard: React.FC<{ repo: Repo }> = ({ repo }) => {
  // FIXME: Smell. Doesn't seem to work to use the object's one
  const img =
    repo.full_name === "juliusmarminge/stocks"
      ? StocksPreview
      : repo.full_name === "juliusmarminge/pathfinding-visualizer"
      ? PfvPreview
      : repo.full_name === "juliusmarminge/sorting-visualizer"
      ? SvPreview
      : repo.full_name === "t3-oss/create-t3-app"
      ? CT3APreview
      : repo.full_name === "trpc/trpc"
      ? TRPCPreview
      : repo.full_name === "t3-oss/create-t3-turbo"
      ? CT3TPreview
      : null;
  if (!img) throw new Error("Add a preview img for repo " + repo.full_name);
  return (
    <div className="rounded-lg bg-base-300 p-4 hover:bg-base-200 ">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">{repo.name}</h3>
          <p className="text-md pb-4">{repo.description}</p>
        </div>
        <StatusCard status={repo.status} />
      </div>
      <NextLink href={repo.homepage || repo.html_url}>
        <Image
          src={img}
          alt="Preview"
          placeholder="blur"
          className="aspect-video w-full rounded-lg"
        />
      </NextLink>

      <div className="flex justify-between">
        <div className="flex items-center gap-4 py-4">
          <div className="flex items-center gap-1">
            <AiOutlineStar className="text-lg text-yellow-500" />
            <span>{repo.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageIcon language={repo.language} />
            <span>{repo.language}</span>
          </div>
        </div>
        <div className="flex items-center">
          <NextLink href={repo.html_url} className="btn btn-ghost">
            <AiOutlineGithub className="text-3xl" />
          </NextLink>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ repos }) => {
  return (
    <>
      <Head key="projects">
        <title>Projects</title>
      </Head>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <ProjectSection
          title="Personal"
          description=" These are some projects that I have built on my spare time as hobby
            projects."
        >
          {repos.personal.map((repo) => (
            <ProjectCard key={repo.name} repo={repo} />
          ))}
        </ProjectSection>
        <ProjectSection
          title="Open Source"
          description="These are some Open Source projets I often contribute to. Some I even maintain."
        >
          {repos.oss.map((repo) => (
            <ProjectCard key={repo.name} repo={repo} />
          ))}
        </ProjectSection>
      </div>
    </>
  );
};

export default ProjectsPage;

// This is the shape from the Github API
const RepoValidator = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string(),
  html_url: z.string().url(),
  homepage: z.string(),
  language: z.string(),
  stargazers_count: z.number(),
});
// then we add the preview image to that shape
type Repo = z.infer<typeof RepoValidator> & {
  img: StaticImageData;
  status: RepoStatus;
};

export const getStaticProps = async () => {
  const repos: Record<keyof typeof REPOS, Repo[]> = { personal: [], oss: [] };

  if (process.env.NODE_ENV === "development") {
    // to prevent rate-limiting during dev
    repos.personal.push(
      {
        name: "stocks",
        full_name: "juliusmarminge/stocks",
        description: "A stock market simulator",
        html_url: "https://github.com/juliusmarminge/stocks",
        homepage: "https://stocks.jumr.dev",
        language: "TypeScript",
        stargazers_count: 42069,
        img: StocksPreview,
        status: "In Progress",
      },
      {
        name: "pathfinding-visualizer",
        full_name: "juliusmarminge/pathfinding-visualizer",
        description: "A pathfinding visualizer",
        html_url: "https://github.com/juliusmarminge/pathfinding-visualizer",
        homepage: "https://pfv.jumr.dev",
        language: "TypeScript",
        stargazers_count: 19,
        img: PfvPreview,
        status: null,
      },
      {
        name: "sorting-visualizer",
        full_name: "juliusmarminge/sorting-visualizer",
        description: "A sorting visualizer",
        html_url: "https://github.com/juliusmarminge/sorting-visualizer",
        homepage: "https://sv.jumr.dev",
        language: "TypeScript",
        stargazers_count: 0,
        img: SvPreview,
        status: null,
      },
    );
    return { props: { repos } };
  }

  for (const repo of REPOS.personal) {
    const repoRes = await (
      await fetch(`https://api.github.com/repos/${repo.name}`)
    ).json();
    const validated = RepoValidator.safeParse(repoRes);
    if (validated.success) {
      repos.personal.push({
        ...validated.data,
        img: repo.img,
        status: repo.status ?? null,
      });
    } else {
      console.log(repoRes);
      console.log(validated.error);
    }
  }

  for (const repo of REPOS.oss) {
    const repoRes = await (
      await fetch(`https://api.github.com/repos/${repo.name}`)
    ).json();
    const validated = RepoValidator.safeParse(repoRes);
    if (validated.success) {
      repos.oss.push({
        ...validated.data,
        img: repo.img,
        status: repo.status ?? null,
      });
    } else {
      console.log(repoRes);
      console.log(validated.error);
    }
  }

  return {
    props: {
      repos,
    },
    revalidate: 86400,
  };
};
