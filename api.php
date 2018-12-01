<?php
class Api {
	static $exclusions = ["*config*", "*eleves*"];
	static function traiter($source) {
		if (isset($source['g'])) {
			return self::afficherGrilles();
		}
		if (isset($source['action'])) {
			switch ($source['action']) {
				case "listegrilles":
					return self::afficherGrilles();
				break;
			}
		}
	}
	static function afficherGrilles() {
		$exclusions = glob("{".implode(",", self::$exclusions)."}.json", GLOB_BRACE);
		$fics = glob("*.json");
		$fics = array_values(array_diff($fics, $exclusions));
		$fics = array_map(function ($f) {
			return preg_replace("#\\.json$#", "", $f);
		}, $fics);

		header("content-type: application/json");
		echo json_encode($fics);
	}
}
Api::traiter($_GET);
