export default function Container({
    children,
    className=""
}){

    return(

        <div
        className={`max-w-[1280px] mx-auto px-3 sm:px-6 ${className}`}
        >

            {children}

        </div>

    )

}