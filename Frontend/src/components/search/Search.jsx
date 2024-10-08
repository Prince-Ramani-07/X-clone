import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { useProfileContext } from "../../context/ProfileContex";
import { useNavigate } from "react-router-dom";
import Spinner from "../../ani/Spinner";

function Search() {
  const { setCurrentProfile, currentProfile } = useProfileContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const {
    data: searchResult,
    mutate,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`user/finduser/${search}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        return data;
      } catch (err) {
        console.log(err);
      }
    },
  });

  const findfast = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim() !== "") mutate();
  };

  //Click

  async function handleClick(personID) {
    setCurrentProfile(personID);
    navigate("/searchuser");
  }

  return (
    <div className="w-screen bg-black text-white pt-12 h-full min-h-screen md:w-5/12 lg:p-0 p-2">
      <div className="m-5 p-2 flex items-center bg-gray-600 rounded-lg border">
        <IoIosSearch className="text-3xl" />
        <input
          className="bg-gray-600 w-full rounded-md h-10 border ml-2 focus:outline-none p-2 min-w-24"
          value={search}
          onChange={(e) => findfast(e)}
        />
      </div>

      {isPending && (
        <div className=" flex justify-center items-center ">
          <Spinner />
        </div>
      )}

      {searchResult?.map((item) => {
        return (
          <div key={item._id} className="cursor-pointer">
            <div
              className="border-b  p-2 px-3 flex items-center active:bg-gray-500 hover:bg-gray-300"
              onClick={() => handleClick(item._id)}
            >
              <div className="border h-fit w-fit rounded-full shrink-0">
                <img
                  src={item.profilePic}
                  className="h-16 w-16 rounded-full object-cover"
                ></img>
              </div>
              <div className="mx-2 p-2 font-bold tracking-wider">
                {item.username}
              </div>
            </div>
          </div>
        );
      })}
      {searchResult?.length === 0 && (
        <p className="text-center text-lg p-2 tracking-wide">
          No such person exists!
        </p>
      )}
    </div>
  );
}

export default Search;
