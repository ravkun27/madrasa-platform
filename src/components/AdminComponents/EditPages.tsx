import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FiSave, FiPlus, FiTrash2, FiChevronDown } from "react-icons/fi";
import { getFetch, putFetch } from "../../utils/apiCall";
import toast from "react-hot-toast";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";

const socialIcons = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  website: FaGlobe,
};

type SocialLink = {
  name: keyof typeof socialIcons;
  link: string;
};

type ContentBlock = {
  subheader: string;
  paragraph: string;
};

type FormData = {
  header?: string;
  paragraph?: string;
  socialLinks?: SocialLink[];
  date?: string;
  content?: ContentBlock[];
};

type PageType = "about" | "contact" | "privacy" | "terms";

const EditPages = () => {
  const [activePage, setActivePage] = useState<PageType>("about");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const aboutUsId = "67d83512b863fa67647e98bd";

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<FormData>({
    defaultValues: {
      header: "",
      paragraph: "",
      socialLinks: [],
      content: [],
    },
  });

  const {
    fields: socialLinksFields,
    append: appendSocialLink,
    remove: removeSocialLink,
  } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const {
    fields: contentFields,
    append: appendContent,
    remove: removeContent,
  } = useFieldArray({
    control,
    name: "content",
  });

  // Fetch data when active page changes
  useEffect(() => {
    fetchData();
  }, [activePage]);
  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      switch (activePage) {
        case "about":
          endpoint = `/public/siteContent/aboutUs`;
          break;
        case "contact":
          endpoint = "/public/siteContent/socialLinks";
          break;
        case "privacy":
          endpoint = "/public/siteContent/privacyPolicy";
          break;
        case "terms":
          endpoint = "/public/siteContent/termsAndConditions";
          break;
      }

      const response: any = await getFetch(endpoint);
      const data = response.data;

      if (data) {
        const formattedData: FormData = {
          header: data.header || "",
          paragraph: data.paragraph || "",
          socialLinks: data || [],
          date: data.date
            ? new Date(data.date).toISOString().split("T")[0]
            : "",
          content: data.content || [],
        };
        reset(formattedData);
      }
    } catch (error) {
      toast.error("Failed to load content");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEndpoint = (page: PageType) => {
    switch (page) {
      case "about":
        return `/admin/auth/control/aboutUs?aboutUsId=${aboutUsId}`;
      case "contact":
        return "/admin/auth/control/socialLinks";
      case "privacy":
        return "/admin/auth/control/privacyPolicy";
      case "terms":
        return "/admin/auth/control/termsAndConditions";
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      let body;
      switch (activePage) {
        case "about":
        case "privacy":
        case "terms":
          body = {
            date: data.date,
            header: data.header,
            content: data.content,
          };
          break;
        case "contact":
          body = { socialLinks: data.socialLinks };
          break;
      }

      await putFetch(getEndpoint(activePage), body);
      toast.success("Content updated successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to update content");
      console.error("Error submitting data:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = () => {
    appendSocialLink({ name: "website", link: "" });
  };

  const handleAddContentBlock = () => {
    appendContent({ subheader: "", paragraph: "" });
  };

  const handleTabChange = (page: PageType) => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to switch tabs?"
      );
      if (!confirmed) return;
    }
    setActivePage(page);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-lg">Loading content...</div>
        </div>
      </div>
    );
  }
  const ensureUrlPrefix = (index: number, value: string) => {
    if (
      value &&
      !value.startsWith("http://") &&
      !value.startsWith("https://")
    ) {
      setValue(`socialLinks.${index}.link`, `https://${value}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Edit Site Pages
      </h1>

      {/* Responsive Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["about", "contact", "privacy", "terms"] as PageType[]).map(
          (page) => (
            <button
              key={page}
              onClick={() => handleTabChange(page)}
              className={`px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg transition-colors ${
                activePage === page
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              }`}
              aria-label={`Switch to ${page} page`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          )
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* About Page Fields */}
        {/* {activePage === "about" && (
          <>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="header"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Header
                </label>
                <input
                  id="header"
                  {...register("header")}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="paragraph"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="paragraph"
                  {...register("paragraph")}
                  rows={6}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )} */}

        {/* Contact Page Fields */}
        {activePage === "contact" && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Social Links
              </h3>
              <button
                type="button"
                onClick={handleAddSocialLink}
                className="flex items-center gap-1 text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2 sm:mt-0"
              >
                <FiPlus size={16} />{" "}
                <span className="hidden sm:inline">Add Link</span>
              </button>
            </div>

            {socialLinksFields.length === 0 && (
              <div className="text-center py-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">
                  No social links added yet. Click the button above to add one.
                </p>
              </div>
            )}

            {socialLinksFields.map((field, index) => {
              const IconComponent =
                socialIcons[field.name as keyof typeof socialIcons] || FaGlobe;
              return (
                <div key={field.id} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-40">
                      <select
                        {...register(`socialLinks.${index}.name` as const)}
                        className="w-full p-2 pr-8 border rounded-md dark:bg-gray-700 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.keys(socialIcons).map((key) => (
                          <option key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <FiChevronDown className="text-gray-500" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-2 border p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                      <IconComponent className="text-gray-500 min-w-5" />
                      <input
                        {...register(`socialLinks.${index}.link` as const)}
                        placeholder="https://..."
                        className="flex-1 bg-transparent border-none focus:outline-none dark:text-white"
                        onBlur={(e) => ensureUrlPrefix(index, e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="w-full sm:w-auto flex justify-center items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-md transition-colors"
                    aria-label="Remove social link"
                  >
                    <FiTrash2 size={16} />{" "}
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Privacy and Terms Pages Fields */}
        {(activePage === "about" ||
          activePage === "privacy" ||
          activePage === "terms") && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="header"
                  className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                >
                  Title
                </label>
                <input
                  id="header"
                  {...register("header")}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Content Sections
                </h3>
                <button
                  type="button"
                  onClick={handleAddContentBlock}
                  className="flex items-center gap-1 text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-2 sm:mt-0"
                >
                  <FiPlus size={16} />{" "}
                  <span className="hidden sm:inline">Add Section</span>
                </button>
              </div>

              {contentFields.length === 0 && (
                <div className="text-center py-4 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-gray-500 dark:text-gray-400">
                    No content sections added yet. Click the button above to add
                    one.
                  </p>
                </div>
              )}

              {contentFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 border p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Section {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeContent(index)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                      aria-label="Remove section"
                    >
                      <FiTrash2 size={16} />{" "}
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>
                  <input
                    {...register(`content.${index}.subheader` as const)}
                    placeholder="Subheader"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    {...register(`content.${index}.paragraph` as const)}
                    placeholder="Content"
                    rows={4}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors w-full sm:w-auto
              ${
                saving || !isDirty
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiSave size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPages;
