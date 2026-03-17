import Navbar from "components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "components/ui/Button";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="home">
      <Navbar />
  <section className="hero">
    <div className="announce">
      <div className="dot">
        <div className="pulse">
        </div>

      </div>
        <p>Introducing Roomify 2.O</p>
    </div>
    <h1> Build Beutiful Spaces at the speed of thought with Roomify</h1>
    <p className="subtitle">
      Rommify is an AI_first design envirnment, that helps you visualize ,render,and ship,architecture projects faster that ever. 
    </p>
    <div className="actions">
      <a href="#upload" className="cta">
        start Building <ArrowRight className="icon"/>
      </a>
      <Button className="demo" variant='outline' size='lg'>
        Watch Demo
      </Button>
    </div>
    <div id='upload' className="upload-shell">
      <div className="grid-overlay" />
      <div className="upload-card">
        <div className="upload-head">
          <div className="upload-icon">
            <Layers className="icon"/>
          </div>
          <h3>Upload Your Floor plan</h3>
          <p>Supports JPG,PNGG,formats up to 10Mb</p>
        </div>
        <p>Upload Images</p>
      </div>

      
    </div>
  </section>
  <section className="projects">
    <div className="section-inner">
      <div className="section-head">
        <div className="copy">
          <h2>Projects</h2>
          <p>your latest work and shared Community Project . all In one Place </p>
        </div>
      </div>
      <div className="projects-grid">
        <div className="project-card group">
          <div className="preview">
            <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project" />
            <div className="badge">
              <span>Community</span>
            </div>
          </div>
          <div className="card-body">
            <div>
              <h3>Project Boseman Chowdick </h3>
              <div className="meta">
                <Clock size={12}/>
                <span>{new Date('01.01.2027').toLocaleDateString()}</span>
                <span>Bhavesh Kumbhare</span>
              </div>
            </div>
            <div className="arrow">
              <ArrowUpRight size={18}/>
            </div>
          </div>

        </div>
      </div>
    </div>

  </section>
  </div>
)
}
