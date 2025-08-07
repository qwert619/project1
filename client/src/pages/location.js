
export const Location = ({children}) => {

    // Get user location only once when component mounts
    return (
            <div className="location">
                {children}
        </div>
    );
};

