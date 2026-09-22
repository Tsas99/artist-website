import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage() {
    return (
        <main className="mx-auto max-w-7xl px-6 pb-24 pt-12 sm:px-8 sm:pt-16 lg:pt-24">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20 xl:gap-28">
                {/* LEFT — Contact information */}
                <section>
                    <h1 className="max-w-[220px] text-3xl font-normal leading-[1.15] tracking-tight text-neutral-950 sm:text-4xl">
                        Open to
                        <br />
                        cooperation.
                    </h1>

                    <div className="mt-12 space-y-8 text-sm sm:mt-14">
                        {/* Email */}
                        <div>
                            <p className="mb-1 text-neutral-400">
                                Email
                            </p>

                            <a
                                href="mailto:tsagaanaa0210@gmail.com"
                                className="text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition-colors duration-200 hover:text-blue-600 hover:decoration-blue-600"
                            >
                                tsagaanaa0210@gmail.com
                            </a>
                        </div>

                        {/* Social */}
                        <div>
                            <p className="mb-3 text-neutral-400">
                                Social
                            </p>

                            <div className="flex flex-col items-start gap-3">
                                {/* Instagram */}
                                <a
                                    href="https://www.instagram.com/tsas_tsagaanaa/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 text-neutral-950 transition-colors duration-200 hover:text-blue-600"
                                >
                                    <InstagramIcon />

                                    <span className="underline decoration-neutral-300 underline-offset-4 transition-colors duration-200 group-hover:decoration-blue-600">
                                        @tsas_tsagaanaa
                                    </span>
                                </a>

                                {/* Vimeo */}
                                <a
                                    href="https://vimeo.com/user174971133"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-2 text-neutral-950 transition-colors duration-200 hover:text-blue-600"
                                >
                                    <VimeoIcon />

                                    <span className="underline decoration-neutral-300 underline-offset-4 transition-colors duration-200 group-hover:decoration-blue-600">
                                        Vimeo
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT — Contact form */}
                <section>
                    <p className="mb-8 text-sm text-neutral-950">
                        Write me here
                    </p>

                    <ContactForm />
                </section>
            </div>
        </main>
    );
}

function InstagramIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
        >
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
            />

            <circle
                cx="12"
                cy="12"
                r="4"
            />

            <circle
                cx="17.5"
                cy="6.5"
                r="0.8"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

function VimeoIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
            className="shrink-0"
        >
            <path d="M22.875 7.052c-.102 2.186-1.626 5.18-4.572 8.982-3.045 3.97-5.62 5.955-7.725 5.955-1.304 0-2.407-1.204-3.31-3.612l-1.806-6.622c-.67-2.408-1.388-3.612-2.157-3.612-.167 0-.752.351-1.756 1.054L.5 7.842c1.104-.97 2.19-1.94 3.26-2.91 1.472-1.271 2.576-1.94 3.31-2.007 1.74-.167 2.81 1.02 3.211 3.562.435 2.743.736 4.448.903 5.117.502 2.275 1.053 3.412 1.655 3.412.468 0 1.17-.735 2.107-2.207.936-1.472 1.438-2.592 1.505-3.361.134-1.271-.368-1.906-1.505-1.906-.536 0-1.087.117-1.655.351 1.103-3.612 3.21-5.368 6.321-5.268 2.308.067 3.396 1.542 3.263 4.427z" />
        </svg>
    );
}