import ClassicTemplate from "../components/templates/ClassicTemplate";
import ModernTemplate from "../components/templates/ModernTemplate";
import MinimalTemplate from "../components/templates/MinimalTemplate";

export default function ResumePreview({ data, template }) {
if (!data) return null;

if (template === "teacher_classic") {
return <ClassicTemplate data={data} />;
}

if (template === "teacher_modern") {
return <ModernTemplate data={data} />;
}

if (template === "teacher_minimal") {
return <MinimalTemplate data={data} />;
}

return <div>Invalid template</div>;
}
