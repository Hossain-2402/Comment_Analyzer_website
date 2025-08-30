"use client";




import "./Home.css";
import {useEffect, useState} from "react";
import axios from "axios";
import {pipeline} from "@xenova/transformers";
import Youtube from "react-youtube";

export default function Home() {

  const [videoID,setVideoID] = useState("");
  const [comments,setComments] = useState([]);
  const [isLoading, setIsLoading] = useState("");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [finishedAnalysis, setFinishedAnalysis] = useState(false);
	
  let positive_comments_counter = 0;
  let negative_comments_counter = 0;

  const [greenFlex, setGreenFlex] = useState(0);
  const [redFlex, setRedFlex] = useState(0);



  const loadVideoComments = ()=>{
    if(videoID == ""){
    	alert("Invalid Video ID");
	return;
    }
    setIsLoading("true");
    axios
      .get("https://www.googleapis.com/youtube/v3/commentThreads", {
        params: {
          part: "snippet",
          videoId: videoID,
          maxResults: 100,
          key: "AIzaSyCq9AM3EVGJr-eO5mSU656oc8Vqv4JrzzA",
        },
      })
      .then((res) => {
        const c = res.data.items.map((item) => {
          const snippet = item.snippet.topLevelComment.snippet;
          return snippet.textDisplay;
        });
        console.log(c);
        setComments(c);
	setIsLoading("false");
      })
      .catch((err) => {
        console.log(err);
      });

	
  }
     


  const analyzeComments = async ()=>{

	setIsAnalysisLoading(true);

	setFinishedAnalysis(false);

  	const p = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
      );

	
	 for (let i = 0; i < comments.length; i++) {
		let current_sentiment = await p(comments[i]);

		const { label } = current_sentiment[0];

		if (label === "POSITIVE") {
			positive_comments_counter++;
		} else if (label === "NEGATIVE") {
			negative_comments_counter++;
		}
	  }

	setIsAnalysisLoading(false);

	setFinishedAnalysis(true);
	

	let pos = positive_comments_counter / (positive_comments_counter + negative_comments_counter);
	let neg = 1 - (positive_comments_counter / (positive_comments_counter + negative_comments_counter));
	
	setGreenFlex(pos);
	setRedFlex(neg);
	
	// console.log(positive_comments_counter / (positive_comments_counter + negative_comments_counter)+ " " + redFlex);
 

	// console.log(positive_comments_counter + " & " + negative_comments_counter);
 
		
  }


let opts = {
	height:"100%",
	width:"100%"
};

  return (      
    <div>
	<div className="background_gradient_color"></div>
       

	<div className="input_button_area">   
            <input type="text" placeholder="Enter video ID" className="search_field"  onChange={(e)=>{ setVideoID(e.target.value);}}/>
            <button className="search_btn" onSubmit={()=>{ loadVideoComments(); }} onClick={()=>{  loadVideoComments() }}>Get</button>
        </div>


	{isLoading === "" ? (
	  <></>
	) : isLoading === "true" ? (
	  <div className="loading_area">
		<div className="loading_box b1"> </div>
		<div className="loading_box b2"> </div>
		<div className="loading_box b3"> </div>
		<div className="loading_box b3"> </div>
	  </div>
	) : (
	  <>
		<div className="youtube_box"> 
			<Youtube opts={opts} videoId={videoID} className="video"/> 
		</div>
		{isAnalysisLoading === true ? (
			  <div className="loading_area ">
				<div className="loading_box b1 analyze_loading"> L </div>
				<div className="loading_box b2 analyze_loading"> O </div>
				<div className="loading_box b3 analyze_loading"> A </div>
				<div className="loading_box b4 analyze_loading"> D </div>
				<div className="loading_box b5 analyze_loading"> I </div>
				<div className="loading_box b6 analyze_loading"> N </div>
				<div className="loading_box b7 analyze_loading"> G </div>
			  </div>
			
		) : (
			<>
				<div className="analyze_comments_btn" onClick={()=>{ analyzeComments(); }}>Analyze Comments</div>
				{finishedAnalysis === true?(
					<>
					<div className="sentiment_bar">
					    <div className="positive" style={{ background:"hsl(120, 73.4%, 63.1%)", flex:greenFlex }}>P</div>
					    <div className="negative" style={{ background:"hsl(8, 100%, 46%)", flex:redFlex }}>N</div>
					</div>
					<div className="legend">
						<div className="legend-row">
							<div className="legend-square green"></div>
							<div className="legend-text">Positive comments ( {greenFlex.toFixed(3) * 100}% )</div>
						</div>
						<div className="legend-row">
							<div className="legend-square red"></div>
							<div className="legend-text">Negative comments ( {redFlex.toFixed(3) * 100}% )</div>
						</div>
					</div>
					</>
				) : (<></>)}	
			</>

		)}
	  </>
	)}

{/*	
	TASK: make a generalized sentence depending on the analysis result

	TASK: Make an animation box that comes under the SEARCH BAR. (from beginning)

	TASK: Make NEVIGATION area

	TASK: Make FOOTER area
*/}

    </div>
  );
}





















